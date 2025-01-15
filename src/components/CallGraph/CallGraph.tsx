import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';

import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { MyContext } from '../../contexts/MyContext';

const removeSvgDimensions = (svgString: string): string => {
    const regex = /<svg[^>]*>/i;
    return svgString.replace(regex, (match) => {
        return match.replace(/width\s*=\s*"[^"]*"\s*|height\s*=\s*"[^"]*"\s*/g, '');
    });
};

type NodeRegistryEntry = {
    name: string;
    to: NodeRegistryEntry[];
    from: NodeRegistryEntry[];
    element: Element;
    // edges1: Element[];
};

const selSome = (
    elref: NodeRegistryEntry,
    selFn: (elref: NodeRegistryEntry, acc: NodeRegistryEntry[]) => NodeRegistryEntry[],
    acc: NodeRegistryEntry[],
) => {
    const elrefs = selFn(elref, acc);
    elrefs.forEach((elref2) => {
        if (!acc.includes(elref2)) selSome(elref2, selFn, acc);
    });
};

const CallGraph = forwardRef<HTMLDivElement>(({}, ref) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult, svgDependencyGraph, setSvgDependencyGraph } = context;

    const localRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

    const renderGraph = async () => {
        if (!conversionResult?.dependencygraph || !localRef?.current) return;
        // const viz = await vizInstance();
        // const svg = viz.renderSVGElement(conversionResult.dependencygraph);
        // localRef.current.innerHTML = svg.outerHTML;

        // const graphviz = gv.Graphviz;
        const graphviz = await Graphviz.load();
        // console.log(graphviz.version());
        conversionResult.dependencygraph = conversionResult.dependencygraph.replaceAll(
            'shape = box',
            'shape = box, style = rounded',
        );
        // console.log(conversionResult.dependencygraph);
        let svg = await graphviz.dot(conversionResult.dependencygraph);
        // need to remove width and height attributes from svg for successful download for domtoimage
        // svg = removeSvgDimensions(svg);
        setSvgDependencyGraph(svg);

        const handleGraphUpdate = () => {
            const graph = localRef.current?.querySelector('g');
            if (!graph) return;

            const highlightNode = (entry?: NodeRegistryEntry) => {
                if (entry) {
                    const highlightNodes: NodeRegistryEntry[] = [];
                    selSome(
                        entry,
                        (elref, acc) => {
                            acc.push(elref);
                            return elref.from;
                        },
                        highlightNodes,
                    );
                    selSome(
                        entry,
                        (elref, acc) => {
                            acc.push(elref);
                            return elref.to;
                        },
                        highlightNodes,
                    );
                    highlightNodes.forEach((elref) =>
                        elref.element.classList.add('selected'),
                    );
                }
            };

            // setup registry
            const nodeRegistry = new Map<string | Element, NodeRegistryEntry>();
            const setupNodesEdges = (el: NodeListOf<Element>, isNode: boolean) => {
                el.forEach((el) => {
                    const title = el.querySelector('title')?.textContent;
                    if (title) {
                        if (isNode) {
                            const entry = {
                                name: title,
                                to: [],
                                from: [],
                                element: el,
                                // edges1: [],
                            };
                            nodeRegistry.set(el, entry);
                            nodeRegistry.set(title, entry);
                        } else {
                            const [src, dst] = title.split('->');
                            const srcNode = nodeRegistry.get(src);
                            const dstNode = nodeRegistry.get(dst);
                            if (!srcNode || !dstNode) return;

                            srcNode.to.push(dstNode);
                            dstNode.from.push(srcNode);
                            // srcNode.edges1.push(el);
                            // dstNode.edges.push(el);
                        }
                    }
                });
            };
            const nodes = graph.querySelectorAll('g.node');
            const edges = graph.querySelectorAll('g.edge');
            setupNodesEdges(nodes, true);
            setupNodesEdges(edges, false);

            // add unhighlight on click handlers
            const deselectAll = () => {
                nodes.forEach((n) => n.classList.remove('selected'));
                edges.forEach((n) => n.classList.remove('selected'));
            };
            graph.addEventListener('click', deselectAll);
            graph.addEventListener('mouseleave', deselectAll);

            // add highlight on click handlers
            nodes.forEach((node) => {
                // node.addEventListener('mouseleave', (e) => {
                //     deselectAll();
                // });
                node.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                });
                node.addEventListener('mouseenter', (e) => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    deselectAll();

                    // select clicked node
                    const entry = nodeRegistry.get(node);
                    highlightNode(entry);
                });
            });
        };

        // if it is already there, just handle it,
        handleGraphUpdate();

        // add mutationobserver to handle dynamic changes after setSvgDependencyGraph is in effect
        const observer = new MutationObserver((mutations) => {
            handleGraphUpdate();
        });
        observer.observe(localRef.current, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    };

    useEffect(() => {
        renderGraph();
    }, [conversionResult, localRef, renderGraph]);

    return (
        <div
            ref={localRef}
            dangerouslySetInnerHTML={{
                __html: svgDependencyGraph || '',
            }}
        ></div>
    );
});

export default CallGraph;
