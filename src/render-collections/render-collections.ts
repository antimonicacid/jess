import { Collection } from "../Collection";

export type RenderCollectionsMessage = {
    command: "renderCollections",
    data: Array<Collection>
}