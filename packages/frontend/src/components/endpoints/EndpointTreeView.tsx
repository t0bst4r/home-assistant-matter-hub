import type { EndpointData } from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useMemo, useState } from "react";
import { EndpointIcon } from "./EndpointIcon.tsx";
import { EndpointName } from "./EndpointName.tsx";

export interface EndpointTreeViewProps {
  endpoint: EndpointData;
  onSelected: (endpoint: EndpointData | undefined) => void;
}

export const EndpointTreeView = (props: EndpointTreeViewProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    findEndpointsWithoutNeighbors(props.endpoint),
  );
  const onSelectionChange = (item: string | null) => {
    let selectedItem: EndpointData | undefined;
    if (item) {
      selectedItem = findSelectedEndpoint(item, props.endpoint);
    }
    props.onSelected(selectedItem);
  };

  return (
    <SimpleTreeView
      expandedItems={expandedItems}
      onExpandedItemsChange={(_, items) => setExpandedItems(items)}
      onSelectedItemsChange={(_, item) => onSelectionChange(item)}
    >
      <EndpointTreeItem endpoint={props.endpoint} />
    </SimpleTreeView>
  );
};

interface EndpointTreeItemProps {
  endpoint: EndpointData;
}

const EndpointTreeItem = (props: EndpointTreeItemProps) => {
  const parts = useMemo(
    () => [...props.endpoint.parts].sort((a, b) => a.endpoint - b.endpoint),
    [props.endpoint],
  );
  return (
    <TreeItem
      itemId={props.endpoint.id.global}
      label={<EndpointTreeItemLabel endpoint={props.endpoint} />}
    >
      {parts.map((part) => (
        <EndpointTreeItem key={part.id.global} endpoint={part} />
      ))}
    </TreeItem>
  );
};

const EndpointTreeItemLabel = (props: EndpointTreeItemProps) => {
  return (
    <Box display="flex">
      <EndpointIcon endpoint={props.endpoint} />
      <Box
        marginLeft={1}
        component="span"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        overflow="hidden"
      >
        <EndpointName endpoint={props.endpoint} />
      </Box>
    </Box>
  );
};

function findEndpointsWithoutNeighbors(endpoint: EndpointData) {
  const result: string[] = [endpoint.id.global];
  const queue = [endpoint];
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.parts.length === 1) {
      result.push(item.parts[0].id.global);
    }
    queue.push(...item.parts);
  }
  return result;
}

function findSelectedEndpoint(globalId: string, root: EndpointData) {
  const queue = [root];
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.id.global === globalId) {
      return item;
    }
    queue.push(...item.parts);
  }
  return undefined;
}
