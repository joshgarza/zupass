import { ticketDisplayName } from "@pcd/eddsa-ticket-pcd";
import { Badge, BadgeConfig } from "@pcd/passport-interface";
import { Pool } from "postgres-pool";
import { sqlQuery } from "../sqlQuery";

export interface IBadgeGiftingDB {
  giveBadges(
    pipelineId: string,
    giverEmail: string,
    receiverEmail: string,
    badges: BadgeConfig[]
  ): Promise<void>;

  getBadges(
    pipelineId: string,
    receiverEmail: string | undefined
  ): Promise<Badge[]>;
}

export class BadgeGiftingDB implements IBadgeGiftingDB {
  private db: Pool;

  public constructor(db: Pool) {
    this.db = db;
  }

  public async giveBadges(
    pipelineId: string,
    giverEmail: string,
    receiverEmail: string,
    badges: BadgeConfig[]
  ): Promise<void> {
    for (const badge of badges) {
      await sqlQuery(
        this.db,
        `
        insert into podbox_given_badges
        (pipeline_id, giver_email, receiver_email, badge_id, badge_name, badge_url)
        values ($1, $2, $3, $4, $5, $6)
        on conflict(pipeline_id, giver_email, receiver_email, badge_id) do nothing
`,
        [
          pipelineId,
          giverEmail,
          receiverEmail,
          badge.id,
          ticketDisplayName(badge.eventName, badge.productName),
          badge.imageUrl
        ]
      );
    }
  }

  public async getBadges(
    pipelineId: string,
    receiverEmail: string
  ): Promise<Badge[]> {
    const res = await sqlQuery(
      this.db,
      `
      select * from podbox_given_badges 
      where pipeline_id=$1 and receiver_email=$2
`,
      [pipelineId, receiverEmail]
    );

    return res.rows.map((r): Badge => {
      return {
        id: r.badge_id
      };
    });
  }
}

export interface IContactSharingDB {
  saveContact(
    pipelineId: string,
    collectorEmail: string,
    contactEmail: string
  ): Promise<void>;

  getContacts(
    pipelineId: string,
    collectorEmail: string | undefined
  ): Promise<string[]>;
}

export class ContactSharingDB implements IContactSharingDB {
  private db: Pool;
  public constructor(db: Pool) {
    this.db = db;
  }

  public async saveContact(
    pipelineId: string,
    collectorEmail: string,
    contactEmail: string
  ): Promise<void> {
    await sqlQuery(
      this.db,
      `
        insert into podbox_collected_contacts
        (pipeline_id, collector_email, contact_email)
        values ($1, $2, $3)
        on conflict(pipeline_id, collector_email, contact_email) do nothing
`,
      [pipelineId, collectorEmail, contactEmail]
    );
  }

  public async getContacts(
    pipelineId: string,
    colletorEmail: string
  ): Promise<string[]> {
    const res = await sqlQuery(
      this.db,
      `
      select * from podbox_collected_contacts 
      where pipeline_id=$1 and collector_email=$2
`,
      [pipelineId, colletorEmail]
    );

    return res.rows.map((r) => r.contact_email);
  }
}
