import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Enum'lar (SQLite'ta metin olarak saklanır)
export type Role = "ADMIN" | "EDITOR";
export type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const id = () =>
  text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());

// ─────────── User ───────────
export const user = sqliteTable("User", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<Role>().notNull().default("ADMIN"),
  createdAt: createdAt(),
});

// ─────────── Service ───────────
export const service = sqliteTable("Service", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Briefcase"),
  features: text("features").notNull().default(""),
  order: integer("order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// ─────────── Post ───────────
export const post = sqliteTable("Post", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("coverImage"),
  author: text("author").notNull().default("ProKosova Solutions"),
  category: text("category"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  publishedAt: integer("publishedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  createdAt: createdAt(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// ─────────── TeamMember ───────────
export const teamMember = sqliteTable("TeamMember", {
  id: id(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  photo: text("photo"),
  email: text("email"),
  linkedin: text("linkedin"),
  order: integer("order").notNull().default(0),
  createdAt: createdAt(),
});

// ─────────── ContactMessage ───────────
export const contactMessage = sqliteTable(
  "ContactMessage",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    subject: text("subject"),
    message: text("message").notNull(),
    serviceId: text("serviceId").references(() => service.id, { onDelete: "set null" }),
    kind: text("kind").notNull().default("contact"),
    status: text("status").$type<MessageStatus>().notNull().default("NEW"),
    createdAt: createdAt(),
  },
  (t) => [index("ContactMessage_status_idx").on(t.status)]
);

// ─────────── Application (Hizmet başvuru formu + belgeler) ───────────
// Şirket kuruluşu gibi hizmetler için yapılandırılmış başvuru.
// Belgeler (pasaport, sabıka, fatura) Cloudflare R2'de saklanır; burada sadece
// R2 nesne anahtarları (key) tutulur. Dosyalar admin panelden güvenli indirilir.
export const application = sqliteTable(
  "Application",
  {
    id: id(),
    serviceSlug: text("serviceSlug").notNull().default("sirket-kurulusu"),
    // Başvuran / iletişim
    applicantName: text("applicantName").notNull(),
    applicantEmail: text("applicantEmail").notNull(),
    applicantPhone: text("applicantPhone"),
    // Şirket bilgileri
    companyName: text("companyName"),
    companyEmail: text("companyEmail"),
    capital: text("capital"),
    directorName: text("directorName"),
    companyAddress: text("companyAddress"),
    naceCodes: text("naceCodes"),
    partnerAddress: text("partnerAddress"),
    notes: text("notes"),
    // Belgeler — R2 nesne anahtarları
    passportKey: text("passportKey"),
    criminalRecordKey: text("criminalRecordKey"),
    utilityBillKey: text("utilityBillKey"),
    status: text("status").$type<MessageStatus>().notNull().default("NEW"),
    createdAt: createdAt(),
  },
  (t) => [index("Application_status_idx").on(t.status)]
);

// ─────────── Appointment ───────────
export const appointment = sqliteTable(
  "Appointment",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    serviceId: text("serviceId").references(() => service.id, { onDelete: "set null" }),
    slot: integer("slot", { mode: "timestamp_ms" }).notNull(),
    note: text("note"),
    status: text("status").$type<AppointmentStatus>().notNull().default("PENDING"),
    createdAt: createdAt(),
  },
  (t) => [index("Appointment_slot_idx").on(t.slot), index("Appointment_status_idx").on(t.status)]
);

// ─────────── İlişkiler (db.query ... with) ───────────
export const serviceRelations = relations(service, ({ many }) => ({
  messages: many(contactMessage),
  appointments: many(appointment),
}));
export const contactMessageRelations = relations(contactMessage, ({ one }) => ({
  service: one(service, { fields: [contactMessage.serviceId], references: [service.id] }),
}));
export const appointmentRelations = relations(appointment, ({ one }) => ({
  service: one(service, { fields: [appointment.serviceId], references: [service.id] }),
}));

export const schema = {
  user,
  service,
  post,
  teamMember,
  contactMessage,
  application,
  appointment,
  serviceRelations,
  contactMessageRelations,
  appointmentRelations,
};
