import { EdDSAPublicKey } from "@pcd/eddsa-pcd";
import { PipelineDefinition } from "@pcd/passport-interface";
import { ILemonadeAPI } from "../../../apis/lemonade/lemonadeAPI";
import { IGenericPretixAPI } from "../../../apis/pretix/genericPretixAPI";
import { IPipelineAtomDB } from "../../../database/queries/pipelineAtomDB";
import { IPipelineCheckinDB } from "../../../database/queries/pipelineCheckinDB";
import { IPipelineConsumerDB } from "../../../database/queries/pipelineConsumerDB";
import { IPipelineSemaphoreHistoryDB } from "../../../database/queries/pipelineSemaphoreHistoryDB";
import {
  IBadgeGiftingDB,
  IContactSharingDB
} from "../../../database/queries/ticketActionDBs";
import { PersistentCacheService } from "../../persistentCacheService";
import { traced } from "../../telemetryService";
import { tracePipeline } from "../honeycombQueries";
import { CSVPipeline } from "./CSVPipeline/CSVPipeline";
import {
  LemonadePipeline,
  isLemonadePipelineDefinition
} from "./LemonadePipeline";
import {
  PretixPipeline,
  isCSVPipelineDefinition,
  isPretixPipelineDefinition
} from "./PretixPipeline";
import { Pipeline } from "./types";

/**
 * Given a {@link PipelineDefinition} (which is persisted to the database) instantiates
 * a {@link Pipeline} so that it can be used for loading data from an external provider,
 * and expose its {@link Capability}s to the external world.
 */
export function instantiatePipeline(
  eddsaPrivateKey: string,
  definition: PipelineDefinition,
  db: IPipelineAtomDB,
  apis: {
    lemonadeAPI: ILemonadeAPI;
    genericPretixAPI: IGenericPretixAPI;
  },
  zupassPublicKey: EdDSAPublicKey,
  rsaPrivateKey: string,
  cacheService: PersistentCacheService,
  checkinDB: IPipelineCheckinDB,
  contactDB: IContactSharingDB,
  badgeDB: IBadgeGiftingDB,
  consumerDB: IPipelineConsumerDB,
  semaphoreHistoryDB: IPipelineSemaphoreHistoryDB
): Promise<Pipeline> {
  return traced("instantiatePipeline", "instantiatePipeline", async () => {
    tracePipeline(definition);

    let pipeline: Pipeline | undefined = undefined;

    if (isLemonadePipelineDefinition(definition)) {
      pipeline = new LemonadePipeline(
        eddsaPrivateKey,
        definition,
        db,
        apis.lemonadeAPI,
        zupassPublicKey,
        cacheService,
        checkinDB,
        contactDB,
        badgeDB,
        consumerDB,
        semaphoreHistoryDB
      );
    } else if (isPretixPipelineDefinition(definition)) {
      pipeline = new PretixPipeline(
        eddsaPrivateKey,
        definition,
        db,
        apis.genericPretixAPI,
        zupassPublicKey,
        cacheService,
        checkinDB,
        consumerDB
      );
    } else if (isCSVPipelineDefinition(definition)) {
      pipeline = new CSVPipeline(
        eddsaPrivateKey,
        definition,
        db,
        zupassPublicKey,
        rsaPrivateKey
      );
    }

    if (pipeline) {
      await pipeline.start();
      return pipeline;
    }

    throw new Error(
      `couldn't instantiate pipeline for configuration ${JSON.stringify(
        definition
      )}`
    );
  });
}
