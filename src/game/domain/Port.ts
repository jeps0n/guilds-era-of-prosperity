export interface Port {
  id: string;

  edgeId: string;

  nodeIds: string[];

  type:
    | "generic"
    | "brick"
    | "lumber"
    | "wheat"
    | "sheep"
    | "ore";

  ratio: number;
}