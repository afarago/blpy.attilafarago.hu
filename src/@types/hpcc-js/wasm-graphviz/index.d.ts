declare module '@hpcc-js/wasm-graphviz' {
    class Graphviz {
        // Define the members and methods of the Graphviz class here
        // For example:
        engine: string;
        render(): string;
        static load(): Promise<Graphviz>;
        dot(dotSource: string, outputFormat?: Format, options?: Options): string;
    }

    export { Graphviz };
}
