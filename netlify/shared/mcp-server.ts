import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ErrorCode,
  McpError,
  ToolAnnotations // Import ToolAnnotations if you plan to use them
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod'; // Import zod for defining schemas
import { conversionService } from './conversion-service';
import { fileService } from './file-service';

const SAMPLE_FILES = [
  "demo_cityshaper_cranemission.lms",
  "demo_cityshaper_cranemission.llsp",
  "demo_cityshaper_cranemission.llsp3",
  "demo_cityshaper_cranemission.lmsp",
  "demo_cityshaper_cranemission.ev3",
  "demo_city_shaper_cranemission.rbf",
  "demo_cityshaper_cranemission_wedo2.proj"
] as const;

async function getFileFromArgs(args: any) {
  if (args.file) {
    return await fileService.getFileFromSample(args.file, process.env.URL);
  } else if (args.file_content && args.file_name) {
    return fileService.getFileFromBase64(args.file_name, args.file_content);
  } else {
    // This error should ideally be caught by Zod validation before reaching here,
    // but it's a good fallback for direct calls or if validation is bypassed.
    throw new Error('Either file (sample) or file_content+file_name must be provided');
  }
}

export class BlocklyPyMcpServer {
  server: McpServer;

  constructor() {
    this.server = new McpServer(
      {
        name: 'blocklypy-mcp-server',
        version: '1.0.0',
        // You can add a description here too if you like
        // description: 'A server for converting LEGO block-based programs to Python and other formats.'
      },
      {
        capabilities: {
          tools: {}, // Still declare tool capabilities here
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Define common optional file input properties
    const commonFileInputProperties = {
      file: z.enum(SAMPLE_FILES).optional().describe('Sample file to convert (use this OR file_content, not both)'),
      file_content: z.string().optional().describe('Base64 encoded file content to convert (use this OR file, not both)'),
      file_name: z.string().optional().describe('Original filename (required when using file_content)'),
    };

    // Helper function to validate file input within the tool callback
    const validateFileInput = (args: { file?: string, file_content?: string, file_name?: string }) => {
      const hasFile = args.file !== undefined;
      const hasContentAndName = args.file_content !== undefined && args.file_name !== undefined;

      if (hasFile && hasContentAndName) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Cannot provide both "file" and ("file_content" AND "file_name").'
        );
      }
      if (!hasFile && !hasContentAndName) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Either "file" OR ("file_content" AND "file_name") must be provided.'
        );
      }
    };

    // Register convert_to_python tool using registerTool
    this.server.registerTool(
      'convert_to_python',
      {
        description: 'Convert LEGO block-based program files to Python code using BlocklyPy',
        inputSchema: z.object({
          ...commonFileInputProperties,
          comments: z.boolean().default(true).describe('Include additional comments in the Python output')
        }).strict() as unknown as z.ZodRawShape
      },
      async (args) => {
        try {
          validateFileInput(args); // Perform validation inside the callback
          const fileResult = await getFileFromArgs(args);
          const config = {
            ...fileResult,
            additionalCommentsChecked: args.comments ?? true,
          };
          const result = await conversionService.convertToPython(config);
          return {
            content: [
              {
                type: 'text',
                text: `Python code generated from ${fileResult.fileName}:\n\n${result.content}`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    // Register convert_to_plain_text tool using registerTool
    this.server.registerTool(
      'convert_to_plain_text',
      {
        description: 'Convert LEGO block-based program files to plain text representation',
        // Double cast: first to unknown, then to z.ZodRawShape
        inputSchema: z.object({
          ...commonFileInputProperties,
          comments: z.boolean().default(false).describe('Include additional comments in the output')
        }).strict() as unknown as z.ZodRawShape
      },
      async (args) => {
        try {
          validateFileInput(args);
          const fileResult = await getFileFromArgs(args);
          const config = {
            ...fileResult,
            additionalCommentsChecked: args.comments ?? true,
          };
          const result = await conversionService.convertToPlain(config);
          return {
            content: [
              {
                type: 'text',
                text: `Plain text representation of ${fileResult.fileName}:\n\n${result.content}`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    // Register generate_dependency_graph tool using registerTool
    this.server.registerTool(
      'generate_dependency_graph',
      {
        description: 'Generate a dependency graph from LEGO block-based program files',
        // Double cast: first to unknown, then to z.ZodRawShape
        inputSchema: z.object({
          ...commonFileInputProperties,
          format: z.enum(['svg', 'png', 'dot', 'txt']).default('svg').describe('Output format for the graph')
        }).strict() as unknown as z.ZodRawShape
      },
      async (args) => {
        try {
          validateFileInput(args);
          const fileResult = await getFileFromArgs(args);
          const config = {
            ...fileResult,
            additionalCommentsChecked: args.comments ?? true,
          };
          const result = await conversionService.generateDependencyGraph(config, args.format || 'svg');
          return {
            content: [
              {
                type: 'text',
                text: `Dependency graph for ${fileResult.fileName} (${args.format || 'svg'} format):\n\n${result.content}`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    // Register generate_preview tool using registerTool
    this.server.registerTool(
      'generate_preview',
      {
        description: 'Generate a graphical preview of LEGO block-based program files',
        // Double cast: first to unknown, then to z.ZodRawShape
        inputSchema: z.object({
          ...commonFileInputProperties,
          format: z.enum(['svg', 'png']).default('svg').describe('Output format for the preview')
        }).strict() as unknown as z.ZodRawShape
      },
      async (args) => {
        try {
          validateFileInput(args);
          const fileResult = await getFileFromArgs(args);
          const config = {
            ...fileResult,
            additionalCommentsChecked: args.comments ?? true,
          };
          const result = await conversionService.generatePreview(config, args.format || 'svg');
          return {
            content: [
              {
                type: 'text',
                text: `Graphical preview of ${fileResult.fileName} (${args.format || 'svg'} format):\n\n${result.content}`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    // Register get_raw_source tool using registerTool
    this.server.registerTool(
      'get_raw_source',
      {
        description: 'Get the raw source content of LEGO block-based program files',
        // Double cast: first to unknown, then to z.ZodRawShape
        inputSchema: z.object({
          ...commonFileInputProperties,
          level: z.number().optional().describe('Specifies the ev3 binary (rbf) source level')
        }).strict() as unknown as z.ZodRawShape
      },
      async (args) => {
        try {
          validateFileInput(args);
          const fileResult = await getFileFromArgs(args);
          const config = {
            ...fileResult,
            rawlevel: args.level ?? 3,
          };
          const result = await conversionService.getRawSource(config);
          return {
            content: [
              {
                type: 'text',
                text: `Raw source content of ${fileResult.fileName}:\n\n${result.content}`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    // Register list_sample_files tool using registerTool
    this.server.registerTool(
      'list_sample_files',
      {
        description: 'List all available sample files that can be used for conversion',
        // Double cast: first to unknown, then to z.ZodRawShape
        inputSchema: z.object({}).strict() as unknown as z.ZodRawShape // No input arguments for this tool
      },
      async () => {
        try {
          return {
            content: [
              {
                type: 'text',
                text: `Available sample files:\n\n${SAMPLE_FILES.map(file => `• ${file}`).join('\n')}\n\nThese files can be used with the 'file' parameter in conversion tools.`
              }
            ]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );
  }
}
