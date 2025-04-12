import type { Route } from "../+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useCallback, useState, useEffect, memo } from "react";
import { ReactFlow, Background, Controls, MiniMap, Position, applyNodeChanges, applyEdgeChanges, Panel, Handle } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, NodeProps } from '@xyflow/react';

// DBから取得するデータの型定義
interface ScrapingArticle {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
}

interface InnerLink {
  linkedArticle: ScrapingArticle;
  linkUrl: string;
}

interface Heading {
  tag: string;
  text: string;
  children: Heading[];
}

interface ScrapingResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
  innerLinks: InnerLink[];
  headings: Heading[];
}

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
  const token = session.get("token");
  const user = session.get("user");

  try {
    // バックエンドAPIからスクレイピング結果を取得
    const response = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { user, data, error: null };
  } catch (error) {
    console.error("Failed to fetch scraping results:", error);
    return { 
      user, 
      data: [], 
      error: error instanceof Error ? error.message : "データの取得に失敗しました" 
    };
  }
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
  const { user, data, error } = useLoaderData<typeof loader>();
  const [apiError, setApiError] = useState<string | null>(error);

  // DBから取得したデータを使用
  const scrapingResults = data as ScrapingResult[];

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
    if (!scrapingResults || scrapingResults.length === 0) return;

    // ノードの作成
    const nodes: FlowNode[] = scrapingResults.map((item, index) => ({
      id: item.id.toString(),
      position: {
        x: Math.cos(index * (2 * Math.PI / scrapingResults.length)) * 500 + 500,
        y: Math.sin(index * (2 * Math.PI / scrapingResults.length)) * 500 + 500,
      },
      data: {
        label: item.metaTitle || 'タイトルなし',
        linkCount: item.innerLinks?.length || 0,
      },
      type: 'custom',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
    }));

    // エッジの作成
    const edges: Edge[] = [];
    scrapingResults.forEach(item => {
      if (item.innerLinks && item.innerLinks.length > 0) {
        item.innerLinks.forEach(link => {
          if (link.linkedArticle) {
            edges.push({
              id: `${item.id}-${link.linkedArticle.id}`,
              source: item.id.toString(),
              target: link.linkedArticle.id.toString(),
              animated: true,
              style: { stroke: '#94a3b8' },
            });
          }
        });
      }
    });

    setNodes(nodes);
    setEdges(edges);
  }, [scrapingResults]);

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

      {apiError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {apiError}
              </div>
            </div>
          </div>
        </div>
      )}

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
