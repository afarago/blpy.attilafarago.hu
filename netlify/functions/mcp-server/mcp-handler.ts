import { Handler, Context } from "@netlify/functions";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { toReqRes, toFetchResponse } from 'fetch-to-node';

// You'll need a utility to convert Netlify's APIGatewayEvent to Node.js Request/Response
// A common library for this is 'fetch-to-node' or similar custom utility.
// For demonstration, I'll assume a simple conversion utility or direct access to request/response streams.
// If 'fetch-to-node' is not available or suitable, you might need to implement a custom adapter.
// For now, let's assume a basic conversion or that Netlify's environment handles it implicitly
// for StreamableHTTPServerTransport when passed the event body.

// IMPORTANT: The actual conversion from Netlify's APIGatewayEvent to a Node.js
// http.IncomingMessage and http.ServerResponse is crucial here.
// The @modelcontextprotocol/sdk's StreamableHTTPServerTransport expects standard Node.js
// request/response objects. Netlify's APIGatewayEvent is not directly compatible.
// A common approach is to use a library like 'fetch-to-node' or 'node-fetch-http-handler'
// to bridge this gap, or manually construct the Node.js request/response objects.
// For simplicity in this example, we'll assume a minimal adaptation or that
// the SDK can infer enough from the event structure, but in a real-world scenario,
// you'd likely need a more robust adapter.

// Initialize the MCP server globally to allow for warm starts.
// This ensures the server instance is reused across invocations if the function stays warm.
import { BlocklyPyMcpServer } from '../../shared/mcp-server'; // Adjusted import path
const mcpServerInstance = new BlocklyPyMcpServer();

const handler: Handler = async (event, context) => {
    // Netlify functions typically only handle POST requests for tools.
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            body: "Request body is missing.",
        };
    }

    try {
        // Convert the Netlify APIGatewayEvent into standard Node.js Request and Response objects
        // that StreamableHTTPServerTransport expects.
        // We pass the event as a 'Request' object to toReqRes.
        const request = new Request(event.path, {
            method: event.httpMethod,
            headers: event.headers as HeadersInit, // Cast to HeadersInit
            body: event.body,
        });
        const { req: nodeReq, res: nodeRes } = toReqRes(request);

        // Create a StreamableHTTPServerTransport instance.
        // You might want to add a sessionIdGenerator for more robust session handling.
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => Math.random().toString(36).substring(2, 15) // Simple session ID generator
        });

        // Connect the MCP server instance to the transport.
        await mcpServerInstance.server.connect(transport);

        // Handle the incoming request using the transport.
        // The transport will write the response directly to nodeRes.
        await transport.handleRequest(nodeReq, nodeRes, event.body);

        // Convert the Node.js ServerResponse back into a Netlify-compatible Response.
        // This will read the buffered response from nodeRes.
        return await toFetchResponse(nodeRes);

    } catch (error) {
        console.error("MCP Serverless Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            }),
        };
    }
};

export { handler };