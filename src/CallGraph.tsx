import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { PyProjectResult } from 'blocklypy';
import { instance as vizInstance } from '@viz-js/viz';

interface CallGraphProps {
    conversionResult?: PyProjectResult;
}

const CallGraph = forwardRef<HTMLDivElement, CallGraphProps>(
    ({ conversionResult }, ref) => {
        const localRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

        useEffect(() => {
            const renderGraph = async () => {
                if (!conversionResult?.dependencygraph || !localRef?.current) return;
                const viz = await vizInstance();
                const svg = viz.renderSVGElement(conversionResult.dependencygraph);
                localRef.current.innerHTML = svg.outerHTML;

                // setup registry
                type NodeRegistryEntry = {
                    name: string;
                    to: NodeRegistryEntry[];
                    from: NodeRegistryEntry[];
                    element: Element;
                    edges1: Element[];
                };
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
                                    edges1: [],
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
                                srcNode.edges1.push(el);
                                // dstNode.edges.push(el);
                            }
                        }
                    });
                };
                const nodes = localRef.current.querySelectorAll('g.node');
                const edges = localRef.current.querySelectorAll('g.edge');
                setupNodesEdges(nodes, true);
                setupNodesEdges(edges, false);

                // add unhighlight on click handlers
                const graph = localRef.current.querySelectorAll('g')[0];
                const deselectAll = () => {
                    nodes.forEach((n) => n.classList.remove('selected'));
                    edges.forEach((n) => n.classList.remove('selected'));
                };
                graph.addEventListener('click', deselectAll);

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

                        const selSome = (
                            elref: NodeRegistryEntry,
                            selFn: (
                                elref: NodeRegistryEntry,
                                acc: NodeRegistryEntry[],
                            ) => NodeRegistryEntry[],
                            acc: NodeRegistryEntry[],
                        ) => {
                            const elrefs = selFn(elref, acc);
                            elrefs.forEach((elref2) => {
                                if (!acc.includes(elref2)) selSome(elref2, selFn, acc);
                            });
                        };

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
                    });
                });
            };
            renderGraph();
        }, [conversionResult, localRef]);

        return <div className="callgraph" ref={localRef} />;
    },
);

export default CallGraph;
