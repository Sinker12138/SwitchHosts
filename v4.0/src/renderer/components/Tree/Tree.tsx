/**
 * Tree
 * @author: oldj
 * @homepage: https://oldj.net
 */

import clsx from 'clsx'
import lodash from 'lodash'
import React, { useEffect, useState } from 'react'
import { flatten, getNodeById, treeMoveNode } from './fn'
import Node, { ITreeNodeData, NodeUpdate } from './Node'
import styles from './style.less'

export type NodeIdType = string;
export type DropWhereType = 'before' | 'in' | 'after';

interface ITreeProps {
  data: ITreeNodeData[];
  className?: string;
  nodeClassName?: string;
  nodeSelectedClassName?: string;
  nodeDropInClassName?: string;
  nodeCollapseArrowClassName?: string;
  nodeRender?: (node: ITreeNodeData, update: NodeUpdate) => React.ReactElement;
  nodeAttr?: (node: ITreeNodeData) => Partial<ITreeNodeData>;
  draggingNodeRender?: (node: ITreeNodeData) => React.ReactElement;
  collapseArrow?: string | React.ReactElement;
  onChange?: (tree: ITreeNodeData[]) => void;
  indent_px?: number;
  selected_id?: NodeIdType;
  onSelect?: (id: NodeIdType) => void;
}

const Tree = (props: ITreeProps) => {
  const { data, className, onChange } = props
  const [tree, setTree] = useState<ITreeNodeData[]>([])
  const [is_dragging, setIsDragging] = useState(false)
  const [drag_source_id, setDragSourceId] = useState<NodeIdType | null>(null)
  const [drop_target_id, setDropTargetId] = useState<NodeIdType | null>(null)
  const [selected_id, setSelectedId] = useState<NodeIdType | null>(props.selected_id || null)
  const [drop_where, setDropWhere] = useState<DropWhereType | null>(null)

  useEffect(() => {
    setTree(lodash.cloneDeep(data))
  }, [data])

  const onDragStart = (id: NodeIdType) => {
    // console.log('onDragStart...')
    setIsDragging(true)
    setDragSourceId(id)
    setDropTargetId(null)
    setDropWhere(null)
  }

  const onDragEnd = () => {
    // console.log(`onDragEnd, ${is_dragging}`)
    if (!is_dragging) return

    if (drag_source_id && drop_target_id && drop_where) {
      // console.log(`onDragEnd: ${source_id} -> ${target_id} | ${drop_where}`)
      let tree2 = treeMoveNode(tree, drag_source_id, drop_target_id, drop_where)
      if (tree2) {
        setTree(tree2)
        onChange && onChange(tree2)
      }
    }

    setIsDragging(false)
    setDragSourceId(null)
    setDropTargetId(null)
    setDropWhere(null)
  }

  const onNodeChange = (id: NodeIdType, data: Partial<ITreeNodeData>) => {
    let node = getNodeById(tree, id)
    if (!node) return

    Object.assign(node, data)
    let tree2 = lodash.cloneDeep(tree)
    setTree(tree2)
    onChange && onChange(tree2)
    console.log(id, data)
  }

  const onSelect = (id: NodeIdType) => {
    setSelectedId(id)
    props.onSelect && props.onSelect(id)
  }

  const has_no_children = flatten(tree).length === tree.length

  return (
    <div className={clsx(styles.root, className)} onDrop={onDragEnd}>
      {tree.map((node) => (
        <Node
          key={node.id}
          tree={tree}
          data={node}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          setDropTargetId={setDropTargetId}
          setDropWhere={setDropWhere}
          drag_source_id={drag_source_id}
          drop_target_id={drop_target_id}
          drag_target_where={drop_where}
          is_dragging={is_dragging}
          level={0}
          render={props.nodeRender}
          draggingNodeRender={props.draggingNodeRender}
          collapseArrow={props.collapseArrow}
          onChange={onNodeChange}
          indent_px={props.indent_px}
          selected_id={selected_id}
          onSelect={onSelect}
          nodeAttr={props.nodeAttr}
          nodeClassName={props.nodeClassName}
          nodeDropInClassName={props.nodeDropInClassName}
          nodeSelectedClassName={props.nodeSelectedClassName}
          nodeCollapseArrowClassName={props.nodeCollapseArrowClassName}
          has_no_children={has_no_children}
        />
      ))}
    </div>
  )
}

export default Tree
