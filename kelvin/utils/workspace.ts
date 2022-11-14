import { Workspace } from "../types";

export function getAvailableActions(workspace: Workspace | null) {
  if (!workspace) return null;
  return workspace.available_actions;
}

export function getCurrentCard(workspace: Workspace | null): Card | null {
  if (workspace === null || workspace.paths == null) {
    return null;
  }
  const focusPath = workspace.paths[workspace.focus_path_id];
  if (focusPath === null) {
    return null;
  }
  const headCard = workspace.cards[focusPath.head_card_id];
  return headCard;
}

export function getSelectedCardRows(workspace: Workspace | null): Row[] {
  const card = getCurrentCard(workspace);
  if (card === null) {
    return [];
  }
  const view = workspace.paths[workspace.focus_path_id].view;
  const selectedRows = card.rows.filter(row => view.selected_row_ids[row.id]);
  return selectedRows;
}

export function getFocusPath(workspace: Workspace | null): Path | null {
  if (workspace === null || workspace.paths == null) {
    return null;
  }
  const focusPath = workspace.paths[workspace.focus_path_id];
  return focusPath;
}

export function getFrontier(workspace: Workspace | null): Frontier | null {
  if (workspace === null) {
    return null;
  }
  const frontier: Frontier = {
    paths: {},
    focus_path_id: workspace.focus_path_id,
  };
  for (const pathId of Object.keys(workspace.paths)) {
    const path = workspace.paths[pathId];
    const card = workspace.cards[path.head_card_id];
    const hydratedPath: HydratedPath = {
      id: path.id,
      label: path.label,
      head_card: card,
      view: path.view,
    };
    frontier.paths[pathId] = hydratedPath;
  }
  return frontier;
}

export function getFocusIndex(workspace: Workspace | null): number | null {
  if (workspace === null || workspace.paths == null) {
    return null;
  }
  const focusPath = workspace.paths[workspace.focus_path_id];
  return focusPath?.view?.focused_row_index;
}

export function updateWorkspace(workspace: Workspace, partialFrontier: PartialFrontier): Workspace {
  const updatedWorkspace: Workspace = { ...workspace };

  // Iterate over the paths in the partial frontier
  for (const [pathId, hydratedPath] of Object.entries(partialFrontier.paths)) {
    const isNewCard = hydratedPath.head_card.id != workspace.paths[pathId].head_card_id;
    // Update the path in the workspace with the new head card, view and label
    updatedWorkspace.paths[pathId] = {
      id: pathId,
      label: hydratedPath.label,
      head_card_id: hydratedPath.head_card.id,
      view: hydratedPath.view,
    };
    if (isNewCard) {
      // Update the cards in workspace with new head cards
      updatedWorkspace.cards[hydratedPath.head_card.id] = hydratedPath.head_card;
      // For the card that has been replaced, make next_id point to the new head card
      updatedWorkspace.cards[hydratedPath.head_card.prev_id].next_id = hydratedPath.head_card.id;
    }
  }

  // Update the focus path id if it is different in the partial frontier
  updatedWorkspace.focus_path_id = partialFrontier.focus_path_id;

  // Return the updated workspace
  return updatedWorkspace;
}
