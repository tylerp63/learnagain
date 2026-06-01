import {
  pgTable,
  text,
  timestamp,
  uuid,
  real,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const decks = pgTable(
  "decks",
  {
    id: uuid("id").primaryKey(),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    sourceFileName: text("sourceFileName").notNull(),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("decks_userId_idx").on(table.userId)]
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey(),
    deckId: uuid("deckId")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    easinessFactor: real("easinessFactor").default(2.5).notNull(),
    interval: integer("interval").default(0).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReviewDate: text("nextReviewDate").notNull(),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("cards_deckId_idx").on(table.deckId),
    index("cards_nextReviewDate_idx").on(table.nextReviewDate),
  ]
);
