export enum SessionMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FeedbackVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum MaterialType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  SLIDE = 'SLIDE',
  EXERCISE = 'EXERCISE',
}

export enum MaterialVisibility {
  PUBLIC = 'PUBLIC',
  TUTOR_ONLY = 'TUTOR_ONLY',
  SESSION_ONLY = 'SESSION_ONLY',
}

export enum SuggestionSource {
  ML_MODEL = 'ML_MODEL',
  RULE_BASED = 'RULE_BASED',
  HYBRID = 'HYBRID',
}

export enum SuggestionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  MEETING = 'MEETING',
  MATERIAL = 'MATERIAL',
  FEEDBACK = 'FEEDBACK',
  SYSTEM = 'SYSTEM',
}


