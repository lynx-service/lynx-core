import type { Route } from "../+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useAtom } from "jotai";
import { scrapingResultsAtom } from "~/atoms/scrapingResults";
import { useCallback, useMemo, useState, useEffect, memo } from "react";
import { ReactFlow, Background, Controls, MiniMap, Position, applyNodeChanges, applyEdgeChanges, Panel, Handle } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, NodeProps } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  linkCount: number;
  [key: string]: unknown;
}

type FlowNode = Node<CustomNodeData>;

const CustomNode = memo(({ data }: { data: CustomNodeData }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Handle type="target" position={Position.Left} />
      <div className="font-medium text-sm truncate">{data.label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {data.linkCount}個のリンク
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

const nodeTypes = {
  custom: CustomNode,
};
import '@xyflow/react/dist/style.css';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "内部リンク相関図 - Lynx" },
    { name: "description", content: "サイト内の内部リンクの関係性を可視化します" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  // TODO: API経由でデータを取得するように修正
  // const res = await fetch("http://localhost:3000/api/internal-links-map", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   }
  // });
  // if (!res.ok) {
  //   throw new Response("Failed to fetch data", { status: res.status });
  // }
  // const data = await res.json();
  // return { data, user };

  return { user };
};

// カスタムノードスタイル
const nodeStyle = {
  padding: 10,
  borderRadius: 5,
  fontSize: 12,
  textAlign: 'center' as const,
  width: 180,
};

// ノードの色を決定する関数
const getNodeColor = (linkCount: number) => {
  if (linkCount >= 10) return '#10b981'; // 多くのリンクを持つノード
  if (linkCount >= 5) return '#60a5fa'; // 中程度のリンクを持つノード
  return '#6b7280'; // 少ないリンクを持つノード
};

export default function InternalLinksMap() {
  const { user } = useLoaderData();
  const [results] = useAtom(scrapingResultsAtom);

  // ノードとエッジの生成
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // ノードの変更を処理
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        return updatedNodes.map(node => ({
          ...node,
          data: node.data as CustomNodeData,
        })) as FlowNode[];
      });
    },
    []
  );

  // エッジの変更を処理
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 初期のノードとエッジを生成
  useEffect(() => {
    const nodes: FlowNode[] = results.map((item, index) => ({
      id: item.id,
      position: {
        x: Math.cos(index * (2 * Math.PI / results.length)) * 500 + 500,
        y: Math.sin(index * (2 * Math.PI / results.length)) * 500 + 500,
      },
      data: {
        label: item.title || 'タイトルなし',
        linkCount: item.internal_links?.length || 0,
      },
      type: 'custom',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
    }));

    const edges: Edge[] = [];
    results.forEach(item => {
      if (item.internal_links) {
        item.internal_links.forEach(link => {
          // リンク先のノードを探す
          const targetNode = results.find(result => result.url === link);
          if (targetNode) {
            edges.push({
              id: `${item.id}-${targetNode.id}`,
              source: item.id,
              target: targetNode.id,
              animated: true,
              style: { stroke: '#94a3b8' },
            });
          }
        });
      }
    });

    setNodes(nodes);
    setEdges(edges);
  }, [results]);

  // ノードクリック時のハンドラ
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    console.log('Selected node:', node);
  }, []);

  return (
    <div className="p-5 space-y-5">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
            内部リンク相関図
          </span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          サイト内の内部リンクの関係性を可視化します
        </p>
      </div>

      {/* フローチャート */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm relative" style={{ height: '70vh', width: '100%' }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', touchAction: 'none' }}>
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={4}
            snapToGrid={true}
            snapGrid={[15, 15]}
            preventScrolling={true}
            deleteKeyCode={null}
            selectionKeyCode={null}
            multiSelectionKeyCode={null}
          >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap nodeColor={(node) => {
            const nodeData = node.data as CustomNodeData;
            return getNodeColor(nodeData.linkCount);
          }} />
          <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              ドラッグ＆ドロップでノードを移動できます
            </div>
          </Panel>
        </ReactFlow>
        </div>
      </div>
    </div>
  );
}
