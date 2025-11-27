#!/usr/bin/env node
/**
 * Script to generate Prisma Client types when prisma generate fails
 * This is a workaround for environments where Prisma binary downloads are blocked
 */

const fs = require('fs');
const path = require('path');

const typesContent = `/**
 * Prisma Client - Custom generated types for EventFlow
 * Flexible types to support all schema fields
 */

import * as runtime from '@prisma/client/runtime/library'

export type UserRole = 'USER' | 'ADMIN'
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'FRAUD' | 'SCAM' | 'MISLEADING' | 'HARASSMENT' | 'OTHER'
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
export type PenaltyType = 'WARNING' | 'SUSPENSION' | 'BAN'
export type EventType = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO'
export type EventCategory = 'CONFERENCIA' | 'WORKSHOP' | 'PALESTRA' | 'FESTA' | 'ESPORTIVO' | 'CULTURAL' | 'EDUCACIONAL' | 'NETWORKING' | 'CORPORATIVO' | 'BENEFICENTE' | 'OUTRO'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  isBanned: boolean
  bannedAt: Date | null
  bannedUntil: Date | null
  banReason: string | null
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  time: string
  endDate: Date | null
  endTime: string | null
  location: string
  visibility: string
  availability: string
  rsvpDeadline: Date | null
  capacity: number | null
  waitlistEnabled: boolean
  showGuestList: boolean
  timezone: string | null
  category: EventCategory
  eventType: EventType
  price: number
  minAge: number | null
  imageUrl: string | null
  onlineUrl: string | null
  tags: string | null
  isHidden: boolean
  hiddenReason: string | null
  hiddenAt: Date | null
  reportCount: number
  ownerId: string
  createdAt: Date
}

export interface Guest {
  id: string
  name: string
  email: string
  status: string
  eventId: string
  userId: string | null
  respondedAt: Date | null
  declineReason: string | null
  createdAt: Date
}

export interface Announcement {
  id: string
  message: string
  eventId: string
  createdBy: string
  createdAt: Date
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  eventId: string
  read: boolean
  createdAt: Date
}

export interface Report {
  id: string
  eventId: string
  reportedBy: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNotes: string | null
  createdAt: Date
}

export interface Penalty {
  id: string
  userId: string
  type: PenaltyType
  reason: string
  details: string | null
  duration: number | null
  expiresAt: Date | null
  isActive: boolean
  createdBy: string
  createdAt: Date
}

export namespace Prisma {
  export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    [K in keyof User]?: boolean
  } & {
    events?: boolean | User$eventsArgs<ExtArgs>
    guests?: boolean | User$guestsArgs<ExtArgs>
    sentMessages?: boolean | User$sentMessagesArgs<ExtArgs>
    receivedMessages?: boolean | User$receivedMessagesArgs<ExtArgs>
    reports?: boolean | User$reportsArgs<ExtArgs>
    penalties?: boolean | User$penaltiesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type EventSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    [K in keyof Event]?: boolean
  } & {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    guests?: boolean | Event$guestsArgs<ExtArgs>
    announcements?: boolean | Event$announcementsArgs<ExtArgs>
    messages?: boolean | Event$messagesArgs<ExtArgs>
    reports?: boolean | Event$reportsArgs<ExtArgs>
    _count?: boolean | EventCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type UserWhereInput = { [key: string]: any }
  export type EventWhereInput = { [key: string]: any }
  export type UserWhereUniqueInput = { [key: string]: any }
  export type EventWhereUniqueInput = { [key: string]: any }
  export type UserUpdateInput = { [key: string]: any }
  export type UserUncheckedUpdateInput = { [key: string]: any }
  export type EventUpdateInput = { [key: string]: any }
  export type EventUncheckedUpdateInput = { [key: string]: any }
  export type EventCreateInput = { [key: string]: any }
  export type EventUncheckedCreateInput = { [key: string]: any }
  export type EventUpdateManyMutationInput = { [key: string]: any }
  export type EventUncheckedUpdateManyInput = { [key: string]: any }
  export type UserOrderByWithRelationInput = { [key: string]: any }
  export type EventOrderByWithRelationInput = { [key: string]: any }

  export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type EventInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type EventOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$eventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$guestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$sentMessagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$receivedMessagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$reportsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type User$penaltiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type Event$guestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type Event$announcementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type Event$messagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type Event$reportsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any
  export type EventCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = any

  export type TransactionClient = any
  export type PrismaPromise<T> = Promise<T>

  export function defineExtension(args: any): (client: any) => PrismaClientExtends<any>
  export type Extension = runtime.Types.Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = runtime.Types.Public.Args
  export import Payload = runtime.Types.Public.Payload
  export import Result = runtime.Types.Public.Result
  export import Exact = runtime.Types.Public.Exact
  export const prismaVersion: { client: string; engine: string }
}

export declare class PrismaClientExtends<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
  $extends: any
  $transaction<R>(fn: (prisma: any) => Promise<R>, options?: any): Promise<R>
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: any): Promise<any>
  $connect(): Promise<void>
  $disconnect(): Promise<void>
  $on(eventType: string, callback: (...args: any[]) => any): void
  $executeRaw(query: TemplateStringsArray | string, ...values: any[]): Prisma.PrismaPromise<number>
  $queryRaw(query: TemplateStringsArray | string, ...values: any[]): Prisma.PrismaPromise<any>

  user: {
    findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>
    findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>
    findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>
    findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>
    findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>
    create<T extends any>(args: T): Prisma.PrismaPromise<any>
    createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>
    delete<T extends any>(args: T): Prisma.PrismaPromise<any>
    update<T extends any>(args: T): Prisma.PrismaPromise<any>
    deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>
    updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>
    upsert<T extends any>(args: T): Prisma.PrismaPromise<any>
    count<T extends any>(args?: T): Prisma.PrismaPromise<number>
    aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>
    groupBy<T extends any>(args: T): Prisma.PrismaPromise<any>
  }

  event: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
  guest: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
  announcement: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
  message: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
  report: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
  penalty: { findUnique<T extends any>(args: T): Prisma.PrismaPromise<any>; findUniqueOrThrow<T extends any>(args: T): Prisma.PrismaPromise<any>; findFirst<T extends any>(args?: T): Prisma.PrismaPromise<any>; findFirstOrThrow<T extends any>(args?: T): Prisma.PrismaPromise<any>; findMany<T extends any>(args?: T): Prisma.PrismaPromise<any[]>; create<T extends any>(args: T): Prisma.PrismaPromise<any>; createMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; delete<T extends any>(args: T): Prisma.PrismaPromise<any>; update<T extends any>(args: T): Prisma.PrismaPromise<any>; deleteMany<T extends any>(args?: T): Prisma.PrismaPromise<{ count: number }>; updateMany<T extends any>(args: T): Prisma.PrismaPromise<{ count: number }>; upsert<T extends any>(args: T): Prisma.PrismaPromise<any>; count<T extends any>(args?: T): Prisma.PrismaPromise<number>; aggregate<T extends any>(args: T): Prisma.PrismaPromise<any>; groupBy<T extends any>(args: T): Prisma.PrismaPromise<any> }
}

export declare class PrismaClient extends PrismaClientExtends {
  constructor(options?: any)
}

export { PrismaClient as default }

export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

export declare const dmmf: any
export declare type dmmf = any
`;

const targetPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'index.d.ts');
const targetDir = path.dirname(targetPath);

// Create directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Created .prisma/client directory');
}

// Write the types file
fs.writeFileSync(targetPath, typesContent);
console.log('✅ Prisma Client types generated successfully!');
console.log('   Location:', targetPath);
