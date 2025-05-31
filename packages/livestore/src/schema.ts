import { Events, makeSchema, Schema, State } from '@livestore/livestore'

// Define database tables
export const tables = {
  users: State.SQLite.table({
    name: 'users',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      email: State.SQLite.text(),
      name: State.SQLite.text(),
      username: State.SQLite.text(),
      avatar: State.SQLite.text({ nullable: true }),
      status: State.SQLite.text({ default: 'offline' }), // online, offline, away, busy
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  servers: State.SQLite.table({
    name: 'servers',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text(),
      description: State.SQLite.text({ nullable: true }),
      icon: State.SQLite.text({ nullable: true }),
      banner: State.SQLite.text({ nullable: true }),
      ownerId: State.SQLite.text(),
      isPublic: State.SQLite.boolean({ default: true }),
      memberCount: State.SQLite.integer({ default: 0 }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  channels: State.SQLite.table({
    name: 'channels',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      serverId: State.SQLite.text(),
      name: State.SQLite.text(),
      description: State.SQLite.text({ nullable: true }),
      type: State.SQLite.text({ default: 'text' }), // text, voice, announcement
      position: State.SQLite.integer({ default: 0 }),
      categoryId: State.SQLite.text({ nullable: true }),
      isPrivate: State.SQLite.boolean({ default: false }),
      createdBy: State.SQLite.text(),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  categories: State.SQLite.table({
    name: 'categories',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      serverId: State.SQLite.text(),
      name: State.SQLite.text(),
      position: State.SQLite.integer({ default: 0 }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    },
  }),

  messages: State.SQLite.table({
    name: 'messages',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      channelId: State.SQLite.text(),
      userId: State.SQLite.text(),
      content: State.SQLite.text(),
      type: State.SQLite.text({ default: 'text' }), // text, image, file, system
      attachments: State.SQLite.text({ nullable: true }), // JSON array of attachments
      replyToId: State.SQLite.text({ nullable: true }),
      isPinned: State.SQLite.boolean({ default: false }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      editedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  reactions: State.SQLite.table({
    name: 'reactions',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      messageId: State.SQLite.text(),
      userId: State.SQLite.text(),
      emoji: State.SQLite.text(),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    },
  }),

  serverMembers: State.SQLite.table({
    name: 'serverMembers',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      serverId: State.SQLite.text(),
      userId: State.SQLite.text(),
      nickname: State.SQLite.text({ nullable: true }),
      joinedAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      roles: State.SQLite.text({ nullable: true }), // JSON array of role IDs
    },
  }),

  roles: State.SQLite.table({
    name: 'roles',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      serverId: State.SQLite.text(),
      name: State.SQLite.text(),
      color: State.SQLite.text({ nullable: true }),
      permissions: State.SQLite.text({ nullable: true }), // JSON array of permissions
      position: State.SQLite.integer({ default: 0 }),
      isHoisted: State.SQLite.boolean({ default: false }),
      isMentionable: State.SQLite.boolean({ default: true }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    },
  }),

  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text(),
      description: State.SQLite.text({ nullable: true }),
      completed: State.SQLite.boolean({ default: false }),
      createdBy: State.SQLite.text(),
      assignedTo: State.SQLite.text({ nullable: true }),
      dueDate: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  invites: State.SQLite.table({
    name: 'invites',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      serverId: State.SQLite.text(),
      channelId: State.SQLite.text({ nullable: true }), // optional specific channel
      inviteCode: State.SQLite.text(), // unique invite code
      createdBy: State.SQLite.text(),
      maxUses: State.SQLite.integer({ nullable: true }), // null = unlimited
      currentUses: State.SQLite.integer({ default: 0 }),
      expiresAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),
}

// Define events for the application
export const events = {
  // User events
  userCreated: Events.synced({
    name: 'v1.UserCreated',
    schema: Schema.Struct({
      id: Schema.String,
      email: Schema.String,
      name: Schema.String,
      username: Schema.String,
      avatar: Schema.String.pipe(Schema.optional),
      status: Schema.String.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),
  userUpdated: Events.synced({
    name: 'v1.UserUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String.pipe(Schema.optional),
      username: Schema.String.pipe(Schema.optional),
      avatar: Schema.String.pipe(Schema.optional),
      status: Schema.String.pipe(Schema.optional),
      updatedAt: Schema.Date,
    }),
  }),

  // Server events
  serverCreated: Events.synced({
    name: 'v1.ServerCreated',
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      description: Schema.String.pipe(Schema.optional),
      icon: Schema.String.pipe(Schema.optional),
      banner: Schema.String.pipe(Schema.optional),
      ownerId: Schema.String,
      isPublic: Schema.Boolean.pipe(Schema.optional),
      memberCount: Schema.Number.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),
  serverUpdated: Events.synced({
    name: 'v1.ServerUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String.pipe(Schema.optional),
      description: Schema.String.pipe(Schema.optional),
      icon: Schema.String.pipe(Schema.optional),
      banner: Schema.String.pipe(Schema.optional),
      memberCount: Schema.Number.pipe(Schema.optional),
      updatedAt: Schema.Date,
    }),
  }),
  serverDeleted: Events.synced({
    name: 'v1.ServerDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.Date,
    }),
  }),

  // Channel events
  channelCreated: Events.synced({
    name: 'v1.ChannelCreated',
    schema: Schema.Struct({
      id: Schema.String,
      serverId: Schema.String,
      name: Schema.String,
      description: Schema.String.pipe(Schema.optional),
      type: Schema.String.pipe(Schema.optional),
      position: Schema.Number.pipe(Schema.optional),
      categoryId: Schema.String.pipe(Schema.optional),
      isPrivate: Schema.Boolean.pipe(Schema.optional),
      createdBy: Schema.String,
      createdAt: Schema.Date,
    }),
  }),
  channelUpdated: Events.synced({
    name: 'v1.ChannelUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String.pipe(Schema.optional),
      description: Schema.String.pipe(Schema.optional),
      position: Schema.Number.pipe(Schema.optional),
      categoryId: Schema.String.pipe(Schema.optional),
      updatedAt: Schema.Date,
    }),
  }),
  channelDeleted: Events.synced({
    name: 'v1.ChannelDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.Date,
    }),
  }),

  // Category events
  categoryCreated: Events.synced({
    name: 'v1.CategoryCreated',
    schema: Schema.Struct({
      id: Schema.String,
      serverId: Schema.String,
      name: Schema.String,
      position: Schema.Number.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),

  // Message events
  messageCreated: Events.synced({
    name: 'v1.MessageCreated',
    schema: Schema.Struct({
      id: Schema.String,
      channelId: Schema.String,
      userId: Schema.String,
      content: Schema.String,
      type: Schema.String.pipe(Schema.optional),
      attachments: Schema.String.pipe(Schema.optional),
      replyToId: Schema.String.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),
  messageUpdated: Events.synced({
    name: 'v1.MessageUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      content: Schema.String,
      editedAt: Schema.Date,
    }),
  }),
  messageDeleted: Events.synced({
    name: 'v1.MessageDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.Date,
    }),
  }),
  messagePinned: Events.synced({
    name: 'v1.MessagePinned',
    schema: Schema.Struct({
      id: Schema.String,
      isPinned: Schema.Boolean,
    }),
  }),

  // Reaction events
  reactionAdded: Events.synced({
    name: 'v1.ReactionAdded',
    schema: Schema.Struct({
      id: Schema.String,
      messageId: Schema.String,
      userId: Schema.String,
      emoji: Schema.String,
      createdAt: Schema.Date,
    }),
  }),
  reactionRemoved: Events.synced({
    name: 'v1.ReactionRemoved',
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),

  // Server member events
  memberJoined: Events.synced({
    name: 'v1.MemberJoined',
    schema: Schema.Struct({
      id: Schema.String,
      serverId: Schema.String,
      userId: Schema.String,
      nickname: Schema.String.pipe(Schema.optional),
      joinedAt: Schema.Date,
      roles: Schema.String.pipe(Schema.optional),
    }),
  }),
  memberLeft: Events.synced({
    name: 'v1.MemberLeft',
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
  memberUpdated: Events.synced({
    name: 'v1.MemberUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      nickname: Schema.String.pipe(Schema.optional),
      roles: Schema.String.pipe(Schema.optional),
    }),
  }),

  // Role events
  roleCreated: Events.synced({
    name: 'v1.RoleCreated',
    schema: Schema.Struct({
      id: Schema.String,
      serverId: Schema.String,
      name: Schema.String,
      color: Schema.String.pipe(Schema.optional),
      permissions: Schema.String.pipe(Schema.optional),
      position: Schema.Number.pipe(Schema.optional),
      isHoisted: Schema.Boolean.pipe(Schema.optional),
      isMentionable: Schema.Boolean.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),

  // Todo/Task events
  todoCreated: Events.synced({
    name: 'v1.TodoCreated',
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      description: Schema.String.pipe(Schema.optional),
      completed: Schema.Boolean.pipe(Schema.optional),
      createdBy: Schema.String,
      assignedTo: Schema.String.pipe(Schema.optional),
      dueDate: Schema.Date.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),
  todoUpdated: Events.synced({
    name: 'v1.TodoUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String.pipe(Schema.optional),
      description: Schema.String.pipe(Schema.optional),
      completed: Schema.Boolean.pipe(Schema.optional),
      assignedTo: Schema.String.pipe(Schema.optional),
      dueDate: Schema.Date.pipe(Schema.optional),
      updatedAt: Schema.Date,
    }),
  }),
  todoDeleted: Events.synced({
    name: 'v1.TodoDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.Date,
    }),
  }),

  // Invite events
  inviteCreated: Events.synced({
    name: 'v1.InviteCreated',
    schema: Schema.Struct({
      id: Schema.String,
      serverId: Schema.String,
      channelId: Schema.String.pipe(Schema.optional),
      inviteCode: Schema.String,
      createdBy: Schema.String,
      maxUses: Schema.Number.pipe(Schema.optional),
      expiresAt: Schema.Date.pipe(Schema.optional),
      createdAt: Schema.Date,
    }),
  }),
  inviteUsed: Events.synced({
    name: 'v1.InviteUsed',
    schema: Schema.Struct({
      id: Schema.String,
      currentUses: Schema.Number,
    }),
  }),
  inviteDeleted: Events.synced({
    name: 'v1.InviteDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.Date,
    }),
  }),
}

// Define materializers to map events to state changes
export const materializers = State.SQLite.materializers(events, {
  // User materializers
  'v1.UserCreated': ({ id, email, name, username, avatar, status, createdAt }) =>
    tables.users.insert({ id, email, name, username, avatar, status, createdAt }),
  'v1.UserUpdated': ({ id, name, username, avatar, status, updatedAt }) =>
    tables.users.update({ name, username, avatar, status, updatedAt }).where({ id }),

  // Server materializers
  'v1.ServerCreated': ({ id, name, description, icon, banner, ownerId, isPublic, memberCount, createdAt }) =>
    tables.servers.insert({ id, name, description, icon, banner, ownerId, isPublic, memberCount, createdAt }),
  'v1.ServerUpdated': ({ id, name, description, icon, banner, memberCount, updatedAt }) =>
    tables.servers.update({ name, description, icon, banner, memberCount, updatedAt }).where({ id }),
  'v1.ServerDeleted': ({ id, deletedAt }) =>
    tables.servers.update({ deletedAt }).where({ id }),

  // Channel materializers
  'v1.ChannelCreated': ({ id, serverId, name, description, type, position, categoryId, isPrivate, createdBy, createdAt }) =>
    tables.channels.insert({ id, serverId, name, description, type, position, categoryId, isPrivate, createdBy, createdAt }),
  'v1.ChannelUpdated': ({ id, name, description, position, categoryId, updatedAt }) =>
    tables.channels.update({ name, description, position, categoryId, updatedAt }).where({ id }),
  'v1.ChannelDeleted': ({ id, deletedAt }) =>
    tables.channels.update({ deletedAt }).where({ id }),

  // Category materializers
  'v1.CategoryCreated': ({ id, serverId, name, position, createdAt }) =>
    tables.categories.insert({ id, serverId, name, position, createdAt }),

  // Message materializers
  'v1.MessageCreated': ({ id, channelId, userId, content, type, attachments, replyToId, createdAt }) =>
    tables.messages.insert({ id, channelId, userId, content, type, attachments, replyToId, createdAt }),
  'v1.MessageUpdated': ({ id, content, editedAt }) =>
    tables.messages.update({ content, editedAt }).where({ id }),
  'v1.MessageDeleted': ({ id, deletedAt }) =>
    tables.messages.update({ deletedAt }).where({ id }),
  'v1.MessagePinned': ({ id, isPinned }) =>
    tables.messages.update({ isPinned }).where({ id }),

  // Reaction materializers
  'v1.ReactionAdded': ({ id, messageId, userId, emoji, createdAt }) =>
    tables.reactions.insert({ id, messageId, userId, emoji, createdAt }),
  'v1.ReactionRemoved': ({ id }) =>
    tables.reactions.delete().where({ id }),

  // Server member materializers
  'v1.MemberJoined': ({ id, serverId, userId, nickname, joinedAt, roles }) =>
    tables.serverMembers.insert({ id, serverId, userId, nickname, joinedAt, roles }),
  'v1.MemberLeft': ({ id }) =>
    tables.serverMembers.delete().where({ id }),
  'v1.MemberUpdated': ({ id, nickname, roles }) =>
    tables.serverMembers.update({ nickname, roles }).where({ id }),

  // Role materializers
  'v1.RoleCreated': ({ id, serverId, name, color, permissions, position, isHoisted, isMentionable, createdAt }) =>
    tables.roles.insert({ id, serverId, name, color, permissions, position, isHoisted, isMentionable, createdAt }),

  // Todo materializers
  'v1.TodoCreated': ({ id, title, description, completed, createdBy, assignedTo, dueDate, createdAt }) =>
    tables.todos.insert({ id, title, description, completed, createdBy, assignedTo, dueDate, createdAt }),
  'v1.TodoUpdated': ({ id, title, description, completed, assignedTo, dueDate, updatedAt }) =>
    tables.todos.update({ title, description, completed, assignedTo, dueDate, updatedAt }).where({ id }),
  'v1.TodoDeleted': ({ id, deletedAt }) =>
    tables.todos.update({ deletedAt }).where({ id }),

  // Invite materializers
  'v1.InviteCreated': ({ id, serverId, channelId, inviteCode, createdBy, maxUses, expiresAt, createdAt }) =>
    tables.invites.insert({ id, serverId, channelId, inviteCode, createdBy, maxUses, currentUses: 0, expiresAt, createdAt }),
  'v1.InviteUsed': ({ id, currentUses }) =>
    tables.invites.update({ currentUses }).where({ id }),
  'v1.InviteDeleted': ({ id, deletedAt }) =>
    tables.invites.update({ deletedAt }).where({ id }),
})

// Create the state
const state = State.SQLite.makeState({ tables, materializers })

// Create and export the schema
export const schema = makeSchema({ events, state }) 