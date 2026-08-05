[1mdiff --git a/apps/api/prisma/schema.prisma b/apps/api/prisma/schema.prisma[m
[1mindex 1fb0c4e..b40d3a6 100644[m
[1m--- a/apps/api/prisma/schema.prisma[m
[1m+++ b/apps/api/prisma/schema.prisma[m
[36m@@ -1,9 +1,3 @@[m
[31m-// ======================================================[m
[31m-// Loss Defender Pro[m
[31m-// Enterprise Warehouse Intelligence Platform[m
[31m-// Prisma Schema v2 (complete — aligned with application modules)[m
[31m-// ======================================================[m
[31m-[m
 generator client {[m
   provider = "prisma-client-js"[m
 }[m
[36m@@ -12,9 +6,585 @@[m [mdatasource db {[m
   provider = "postgresql"[m
 }[m
 [m
[31m-// ------------------------------------------------------[m
[31m-// Enums[m
[31m-// ------------------------------------------------------[m
[32m+[m[32mmodel Company {[m
[32m+[m[32m  id            String             @id @default(uuid())[m
[32m+[m[32m  /// Primary business code (also exposed as companyCode in richer modules)[m
[32m+[m[32m  code          String             @unique @db.VarChar(30)[m
[32m+[m[32m  name          String             @db.VarChar(150)[m
[32m+[m[32m  email         String?            @unique @db.VarChar(150)[m
[32m+[m[32m  phone         String?            @db.VarChar(20)[m
[32m+[m[32m  status        CompanyStatus      @default(ACTIVE)[m
[32m+[m[32m  /// Optional rich-module fields (companies/ module)[m
[32m+[m[32m  legalName     String?            @db.VarChar(200)[m
[32m+[m[32m  companyType   String?            @db.VarChar(50)[m
[32m+[m[32m  gstNumber     String?            @db.VarChar(30)[m
[32m+[m[32m  panNumber     String?            @db.VarChar(20)[m
[32m+[m[32m  emailVerified Boolean            @default(false)[m
[32m+[m[32m  phoneVerified Boolean            @default(false)[m
[32m+[m[32m  blockReason   String?[m
[32m+[m[32m  blockedAt     DateTime?[m
[32m+[m[32m  address       Json?[m
[32m+[m[32m  contact       Json?[m
[32m+[m[32m  branding      Json?[m
[32m+[m[32m  subscription  Json?[m
[32m+[m[32m  settings      Json?[m
[32m+[m[32m  storage       Json?[m
[32m+[m[32m  createdAt     DateTime           @default(now())[m
[32m+[m[32m  updatedAt     DateTime           @updatedAt[m
[32m+[m[32m  deletedAt     DateTime?[m
[32m+[m[32m  isDeleted     Boolean            @default(false)[m
[32m+[m[32m  aiJobs        AIJob[][m
[32m+[m[32m  claims        Claim[][m
[32m+[m[32m  evidences     Evidence[][m
[32m+[m[32m  notifications Notification[][m
[32m+[m[32m  orders        Order[][m
[32m+[m[32m  recordings    RecordingSession[][m
[32m+[m[32m  reports       Report[][m
[32m+[m[32m  returns       Return[][m
[32m+[m[32m  scanners      Scanner[][m
[32m+[m[32m  uploads       Upload[][m
[32m+[m[32m  users         User[][m
[32m+[m[32m  warehouses    Warehouse[][m
[32m+[m
[32m+[m[32m  @@index([gstNumber])[m
[32m+[m[32m  @@index([panNumber])[m
[32m+[m[32m  @@map("companies")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel User {[m
[32m+[m[32m  id                String             @id @default(uuid())[m
[32m+[m[32m  companyId         String[m
[32m+[m[32m  firstName         String             @db.VarChar(100)[m
[32m+[m[32m  lastName          String             @db.VarChar(100)[m
[32m+[m[32m  email             String             @unique @db.VarChar(150)[m
[32m+[m[32m  /// Rich users/ module fields[m
[32m+[m[32m  username          String?            @unique @db.VarChar(100)[m
[32m+[m[32m  employeeCode      String?            @db.VarChar(50)[m
[32m+[m[32m  passwordHash      String[m
[32m+[m[32m  refreshTokenHash  String?[m
[32m+[m[32m  role              UserRole           @default(OPERATOR)[m
[32m+[m[32m  status            UserStatus         @default(PENDING)[m
[32m+[m[32m  lastLoginAt       DateTime?[m
[32m+[m[32m  passwordChangedAt DateTime?[m
[32m+[m[32m  profile           Json?[m
[32m+[m[32m  assignment        Json?[m
[32m+[m[32m  permissions       Json?[m
[32m+[m[32m  statistics        Json?[m
[32m+[m[32m  emailVerified     Boolean            @default(false)[m
[32m+[m[32m  phoneVerified     Boolean            @default(false)[m
[32m+[m[32m  twoFactorEnabled  Boolean            @default(false)[m
[32m+[m[32m  createdAt         DateTime           @default(now())[m
[32m+[m[32m  updatedAt         DateTime           @updatedAt[m
[32m+[m[32m  deletedAt         DateTime?[m
[32m+[m[32m  isDeleted         Boolean            @default(false)[m
[32m+[m[32m  claimsAssigned    Claim[]            @relation("ClaimAssignedTo")[m
[32m+[m[32m  claimsResolved    Claim[]            @relation("ClaimResolvedBy")[m
[32m+[m[32m  notifications     Notification[][m
[32m+[m[32m  ordersCreated     Order[]            @relation("OrderCreatedBy")[m
[32m+[m[32m  recordings        RecordingSession[] @relation("RecordingOperator")[m
[32m+[m[32m  reportsGenerated  Report[]           @relation("ReportGeneratedBy")[m
[32m+[m[32m  returnsAssigned   Return[]           @relation("ReturnAssignedTo")[m
[32m+[m[32m  returnsResolved   Return[]           @relation("ReturnResolvedBy")[m
[32m+[m[32m  scansScanned      Scanner[]          @relation("ScanScannedBy")[m
[32m+[m[32m  scansVerified     Scanner[]          @relation("ScanVerifiedBy")[m
[32m+[m[32m  company           Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([email])[m
[32m+[m[32m  @@index([username])[m
[32m+[m[32m  @@index([employeeCode])[m
[32m+[m[32m  @@map("users")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Warehouse {[m
[32m+[m[32m  id             String             @id @default(uuid())[m
[32m+[m[32m  companyId      String[m
[32m+[m[32m  code           String             @db.VarChar(30)[m
[32m+[m[32m  name           String             @db.VarChar(150)[m
[32m+[m[32m  description    String?            @db.VarChar(500)[m
[32m+[m[32m  /// Flat address fields (lean warehouse module)[m
[32m+[m[32m  address        String?            @db.VarChar(500)[m
[32m+[m[32m  city           String?            @db.VarChar(100)[m
[32m+[m[32m  state          String?            @db.VarChar(100)[m
[32m+[m[32m  country        String?            @db.VarChar(100)[m
[32m+[m[32m  pincode        String?            @db.VarChar(20)[m
[32m+[m[32m  phone          String?            @db.VarChar(20)[m
[32m+[m[32m  email          String?            @db.VarChar(150)[m
[32m+[m[32m  isActive       Boolean            @default(true)[m
[32m+[m[32m  /// Rich warehouses/ module fields[m
[32m+[m[32m  warehouseType  String?            @db.VarChar(50)[m
[32m+[m[32m  status         String?            @db.VarChar(30)[m
[32m+[m[32m  timezone       String?            @db.VarChar(50)[m
[32m+[m[32m  operatingHours String?[m
[32m+[m[32m  contactEmail   String?            @db.VarChar(150)[m
[32m+[m[32m  contactPhone   String?            @db.VarChar(30)[m
[32m+[m[32m  isDefault      Boolean            @default(false)[m
[32m+[m[32m  /// structured address object[m
[32m+[m[32m  addressJson    Json?[m
[32m+[m[32m  location       Json?[m
[32m+[m[32m  manager        Json?[m
[32m+[m[32m  capacity       Json?[m
[32m+[m[32m  createdAt      DateTime           @default(now())[m
[32m+[m[32m  updatedAt      DateTime           @updatedAt[m
[32m+[m[32m  deletedAt      DateTime?[m
[32m+[m[32m  isDeleted      Boolean            @default(false)[m
[32m+[m[32m  aiJobs         AIJob[][m
[32m+[m[32m  claims         Claim[][m
[32m+[m[32m  evidences      Evidence[][m
[32m+[m[32m  orders         Order[][m
[32m+[m[32m  recordings     RecordingSession[][m
[32m+[m[32m  reports        Report[][m
[32m+[m[32m  returns        Return[][m
[32m+[m[32m  scanners       Scanner[][m
[32m+[m[32m  uploads        Upload[][m
[32m+[m[32m  company        Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m
[32m+[m[32m  @@unique([companyId, code])[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([name])[m
[32m+[m[32m  @@map("warehouses")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Order {[m
[32m+[m[32m  id                    String             @id @default(uuid())[m
[32m+[m[32m  companyId             String[m
[32m+[m[32m  warehouseId           String[m
[32m+[m[32m  createdById           String[m
[32m+[m[32m  marketplace           Marketplace[m
[32m+[m[32m  marketplaceOrderId    String?            @db.VarChar(100)[m
[32m+[m[32m  marketplaceShipmentId String?            @db.VarChar(100)[m
[32m+[m[32m  orderNumber           String             @db.VarChar(100)[m
[32m+[m[32m  awbNumber             String?            @db.VarChar(100)[m
[32m+[m[32m  customerName          String?            @db.VarChar(150)[m
[32m+[m[32m  customerPhone         String?            @db.VarChar(30)[m
[32m+[m[32m  status                OrderStatus        @default(CREATED)[m
[32m+[m[32m  packingStatus         PackingStatus      @default(PENDING)[m
[32m+[m[32m  verificationStatus    VerificationStatus @default(PENDING)[m
[32m+[m[32m  priority              OrderPriority      @default(MEDIUM)[m
[32m+[m[32m  expectedItemCount     Int                @default(0)[m
[32m+[m[32m  verifiedItemCount     Int                @default(0)[m
[32m+[m[32m  /// Rich orders/ module fields[m
[32m+[m[32m  customerId            String?[m
[32m+[m[32m  assignedTo            String?[m
[32m+[m[32m  trackingNumber        String?            @db.VarChar(100)[m
[32m+[m[32m  courier               String?            @db.VarChar(100)[m
[32m+[m[32m  recordingId           String?[m
[32m+[m[32m  evidenceId            String?[m
[32m+[m[32m  claimId               String?[m
[32m+[m[32m  returnId              String?[m
[32m+[m[32m  remarks               String?[m
[32m+[m[32m  items                 Json?[m
[32m+[m[32m  customer              Json?[m
[32m+[m[32m  shippingAddress       Json?[m
[32m+[m[32m  metadata              Json?[m
[32m+[m[32m  createdAt             DateTime           @default(now())[m
[32m+[m[32m  updatedAt             DateTime           @updatedAt[m
[32m+[m[32m  deletedAt             DateTime?[m
[32m+[m[32m  isDeleted             Boolean            @default(false)[m
[32m+[m[32m  aiJobs                AIJob[][m
[32m+[m[32m  claims                Claim[][m
[32m+[m[32m  evidences             Evidence[][m
[32m+[m[32m  company               Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  createdBy             User               @relation("OrderCreatedBy", fields: [createdById], references: [id])[m
[32m+[m[32m  warehouse             Warehouse          @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  recordings            RecordingSession[][m
[32m+[m[32m  returns               Return[][m
[32m+[m[32m  scanners              Scanner[][m
[32m+[m[32m  uploads               Upload[][m
[32m+[m
[32m+[m[32m  @@unique([companyId, marketplace, marketplaceOrderId])[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([createdById])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([packingStatus])[m
[32m+[m[32m  @@index([priority])[m
[32m+[m[32m  @@index([marketplace])[m
[32m+[m[32m  @@index([orderNumber])[m
[32m+[m[32m  @@index([awbNumber])[m
[32m+[m[32m  @@index([assignedTo])[m
[32m+[m[32m  @@index([customerId])[m
[32m+[m[32m  @@map("orders")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel RecordingSession {[m
[32m+[m[32m  id               String          @id @default(uuid())[m
[32m+[m[32m  companyId        String[m
[32m+[m[32m  warehouseId      String[m
[32m+[m[32m  orderId          String[m
[32m+[m[32m  operatorId       String[m
[32m+[m[32m  status           RecordingStatus @default(CREATED)[m
[32m+[m[32m  startedAt        DateTime?[m
[32m+[m[32m  pausedAt         DateTime?[m
[32m+[m[32m  resumedAt        DateTime?[m
[32m+[m[32m  stoppedAt        DateTime?[m
[32m+[m[32m  durationSeconds  Int             @default(0)[m
[32m+[m[32m  localFileName    String?[m
[32m+[m[32m  originalFileName String?[m
[32m+[m[32m  fileUrl          String?[m
[32m+[m[32m  thumbnailUrl     String?[m
[32m+[m[32m  fileSize         BigInt?[m
[32m+[m[32m  createdAt        DateTime        @default(now())[m
[32m+[m[32m  updatedAt        DateTime        @updatedAt[m
[32m+[m[32m  deletedAt        DateTime?[m
[32m+[m[32m  isDeleted        Boolean         @default(false)[m
[32m+[m[32m  aiJobs           AIJob[][m
[32m+[m[32m  claims           Claim[][m
[32m+[m[32m  evidences        Evidence[][m
[32m+[m[32m  company          Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  operator         User            @relation("RecordingOperator", fields: [operatorId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  order            Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  warehouse        Warehouse       @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  returns          Return[][m
[32m+[m[32m  scanners         Scanner[][m
[32m+[m[32m  uploads          Upload[][m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([operatorId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@map("recording_sessions")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Evidence {[m
[32m+[m[32m  id                String           @id @default(uuid())[m
[32m+[m[32m  companyId         String[m
[32m+[m[32m  warehouseId       String[m
[32m+[m[32m  orderId           String[m
[32m+[m[32m  recordingId       String[m
[32m+[m[32m  status            EvidenceStatus   @default(CREATED)[m
[32m+[m[32m  type              EvidenceType     @default(PACKING_VIDEO)[m
[32m+[m[32m  originalVideoUrl  String?[m
[32m+[m[32m  processedVideoUrl String?[m
[32m+[m[32m  thumbnailUrl      String?[m
[32m+[m[32m  hash              String?[m
[32m+[m[32m  checksum          String?[m
[32m+[m[32m  durationSeconds   Int              @default(0)[m
[32m+[m[32m  fileSize          BigInt?[m
[32m+[m[32m  metadata          Json?[m
[32m+[m[32m  generatedAt       DateTime?[m
[32m+[m[32m  verifiedAt        DateTime?[m
[32m+[m[32m  archivedAt        DateTime?[m
[32m+[m[32m  createdAt         DateTime         @default(now())[m
[32m+[m[32m  updatedAt         DateTime         @updatedAt[m
[32m+[m[32m  deletedAt         DateTime?[m
[32m+[m[32m  isDeleted         Boolean          @default(false)[m
[32m+[m[32m  aiJobs            AIJob[][m
[32m+[m[32m  claims            Claim[][m
[32m+[m[32m  company           Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  order             Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  recording         RecordingSession @relation(fields: [recordingId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  warehouse         Warehouse        @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  returns           Return[][m
[32m+[m[32m  scanners          Scanner[][m
[32m+[m[32m  uploads           Upload[][m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([recordingId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@map("evidence")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Upload {[m
[32m+[m[32m  id           String            @id @default(uuid())[m
[32m+[m[32m  companyId    String[m
[32m+[m[32m  warehouseId  String[m
[32m+[m[32m  orderId      String?[m
[32m+[m[32m  recordingId  String?[m
[32m+[m[32m  evidenceId   String?[m
[32m+[m[32m  originalName String[m
[32m+[m[32m  fileName     String[m
[32m+[m[32m  storageKey   String            @unique[m
[32m+[m[32m  bucket       String[m
[32m+[m[32m  provider     String[m
[32m+[m[32m  mimeType     String[m
[32m+[m[32m  extension    String[m
[32m+[m[32m  category     UploadCategory[m
[32m+[m[32m  visibility   UploadVisibility  @default(PRIVATE)[m
[32m+[m[32m  status       UploadStatus      @default(PENDING)[m
[32m+[m[32m  size         BigInt            @default(0)[m
[32m+[m[32m  checksum     String?[m
[32m+[m[32m  hash         String?[m
[32m+[m[32m  etag         String?[m
[32m+[m[32m  metadata     Json?[m
[32m+[m[32m  uploadedAt   DateTime?[m
[32m+[m[32m  expiresAt    DateTime?[m
[32m+[m[32m  createdAt    DateTime          @default(now())[m
[32m+[m[32m  updatedAt    DateTime          @updatedAt[m
[32m+[m[32m  deletedAt    DateTime?[m
[32m+[m[32m  isDeleted    Boolean           @default(false)[m
[32m+[m[32m  aiJobs       AIJob[][m
[32m+[m[32m  company      Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  evidence     Evidence?         @relation(fields: [evidenceId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  order        Order?            @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  recording    RecordingSession? @relation(fields: [recordingId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  warehouse    Warehouse         @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([recordingId])[m
[32m+[m[32m  @@index([evidenceId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([category])[m
[32m+[m[32m  @@index([storageKey])[m
[32m+[m[32m  @@map("uploads")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel AIJob {[m
[32m+[m[32m  id             String            @id @default(uuid())[m
[32m+[m[32m  companyId      String[m
[32m+[m[32m  warehouseId    String[m
[32m+[m[32m  orderId        String?[m
[32m+[m[32m  uploadId       String?[m
[32m+[m[32m  recordingId    String?[m
[32m+[m[32m  evidenceId     String?[m
[32m+[m[32m  provider       AIProvider[m
[32m+[m[32m  model          String[m
[32m+[m[32m  jobType        String[m
[32m+[m[32m  status         AIJobStatus       @default(PENDING)[m
[32m+[m[32m  prompt         String[m
[32m+[m[32m  input          Json[m
[32m+[m[32m  output         Json?[m
[32m+[m[32m  confidence     Float             @default(0)[m
[32m+[m[32m  tokensUsed     Int?[m
[32m+[m[32m  processingTime Int?[m
[32m+[m[32m  error          String?[m
[32m+[m[32m  startedAt      DateTime?[m
[32m+[m[32m  completedAt    DateTime?[m
[32m+[m[32m  metadata       Json?[m
[32m+[m[32m  createdAt      DateTime          @default(now())[m
[32m+[m[32m  updatedAt      DateTime          @updatedAt[m
[32m+[m[32m  deletedAt      DateTime?[m
[32m+[m[32m  isDeleted      Boolean           @default(false)[m
[32m+[m[32m  company        Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  evidence       Evidence?         @relation(fields: [evidenceId], references: [id])[m
[32m+[m[32m  order          Order?            @relation(fields: [orderId], references: [id])[m
[32m+[m[32m  recording      RecordingSession? @relation(fields: [recordingId], references: [id])[m
[32m+[m[32m  upload         Upload?           @relation(fields: [uploadId], references: [id])[m
[32m+[m[32m  warehouse      Warehouse         @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  claims         Claim[][m
[32m+[m[32m  returns        Return[][m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([provider])[m
[32m+[m[32m  @@map("ai_jobs")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Notification {[m
[32m+[m[32m  id                String               @id @default(uuid())[m
[32m+[m[32m  userId            String?[m
[32m+[m[32m  companyId         String?[m
[32m+[m[32m  title             String[m
[32m+[m[32m  body              String[m
[32m+[m[32m  channel           NotificationChannel[m
[32m+[m[32m  priority          NotificationPriority @default(MEDIUM)[m
[32m+[m[32m  status            NotificationStatus   @default(PENDING)[m
[32m+[m[32m  template          String?[m
[32m+[m[32m  recipient         String[m
[32m+[m[32m  subject           String?[m
[32m+[m[32m  provider          String?[m
[32m+[m[32m  providerMessageId String?[m
[32m+[m[32m  data              Json?[m
[32m+[m[32m  metadata          Json?[m
[32m+[m[32m  retryCount        Int                  @default(0)[m
[32m+[m[32m  scheduledAt       DateTime?[m
[32m+[m[32m  sentAt            DateTime?[m
[32m+[m[32m  deliveredAt       DateTime?[m
[32m+[m[32m  readAt            DateTime?[m
[32m+[m[32m  failedAt          DateTime?[m
[32m+[m[32m  failureReason     String?[m
[32m+[m[32m  expiresAt         DateTime?[m
[32m+[m[32m  createdAt         DateTime             @default(now())[m
[32m+[m[32m  updatedAt         DateTime             @updatedAt[m
[32m+[m[32m  deletedAt         DateTime?[m
[32m+[m[32m  isDeleted         Boolean              @default(false)[m
[32m+[m[32m  company           Company?             @relation(fields: [companyId], references: [id])[m
[32m+[m[32m  user              User?                @relation(fields: [userId], references: [id])[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([userId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([channel])[m
[32m+[m[32m  @@map("notifications")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Claim {[m
[32m+[m[32m  id               String               @id @default(uuid())[m
[32m+[m[32m  claimNumber      String               @unique @db.VarChar(50)[m
[32m+[m[32m  companyId        String[m
[32m+[m[32m  warehouseId      String[m
[32m+[m[32m  orderId          String[m
[32m+[m[32m  recordingId      String?[m
[32m+[m[32m  evidenceId       String?[m
[32m+[m[32m  aiJobId          String?[m
[32m+[m[32m  assignedTo       String?[m
[32m+[m[32m  resolvedBy       String?[m
[32m+[m[32m  status           ClaimStatus          @default(DRAFT)[m
[32m+[m[32m  priority         ClaimPriority        @default(MEDIUM)[m
[32m+[m[32m  resolutionType   ClaimResolutionType?[m
[32m+[m[32m  title            String[m
[32m+[m[32m  description      String[m
[32m+[m[32m  customerRemarks  String?[m
[32m+[m[32m  internalRemarks  String?[m
[32m+[m[32m  aiSummary        String?[m
[32m+[m[32m  aiConfidence     Float                @default(0)[m
[32m+[m[32m  aiRecommendation String?[m
[32m+[m[32m  metadata         Json?[m
[32m+[m[32m  resolutionData   Json?[m
[32m+[m[32m  resolvedAt       DateTime?[m
[32m+[m[32m  closedAt         DateTime?[m
[32m+[m[32m  createdAt        DateTime             @default(now())[m
[32m+[m[32m  updatedAt        DateTime             @updatedAt[m
[32m+[m[32m  deletedAt        DateTime?[m
[32m+[m[32m  isDeleted        Boolean              @default(false)[m
[32m+[m[32m  aiJob            AIJob?               @relation(fields: [aiJobId], references: [id])[m
[32m+[m[32m  assignee         User?                @relation("ClaimAssignedTo", fields: [assignedTo], references: [id])[m
[32m+[m[32m  company          Company              @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  evidence         Evidence?            @relation(fields: [evidenceId], references: [id])[m
[32m+[m[32m  order            Order                @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  recording        RecordingSession?    @relation(fields: [recordingId], references: [id])[m
[32m+[m[32m  resolver         User?                @relation("ClaimResolvedBy", fields: [resolvedBy], references: [id])[m
[32m+[m[32m  warehouse        Warehouse            @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  returns          Return[][m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([priority])[m
[32m+[m[32m  @@map("claims")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Return {[m
[32m+[m[32m  id                        String                @id @default(uuid())[m
[32m+[m[32m  returnNumber              String                @unique @db.VarChar(50)[m
[32m+[m[32m  companyId                 String[m
[32m+[m[32m  warehouseId               String[m
[32m+[m[32m  orderId                   String[m
[32m+[m[32m  claimId                   String?[m
[32m+[m[32m  recordingId               String?[m
[32m+[m[32m  evidenceId                String?[m
[32m+[m[32m  aiJobId                   String?[m
[32m+[m[32m  assignedTo                String?[m
[32m+[m[32m  resolvedBy                String?[m
[32m+[m[32m  status                    ReturnStatus          @default(DRAFT)[m
[32m+[m[32m  priority                  ReturnPriority        @default(MEDIUM)[m
[32m+[m[32m  resolutionType            ReturnResolutionType?[m
[32m+[m[32m  marketplace               String[m
[32m+[m[32m  marketplaceReturnId       String?[m
[32m+[m[32m  title                     String[m
[32m+[m[32m  description               String[m
[32m+[m[32m  customerReason            String?[m
[32m+[m[32m  internalRemarks           String?[m
[32m+[m[32m  aiSummary                 String?[m
[32m+[m[32m  aiConfidence              Float                 @default(0)[m
[32m+[m[32m  aiRecommendation          String?[m
[32m+[m[32m  refundAmount              Float?[m
[32m+[m[32m  refundCurrency            String?[m
[32m+[m[32m  replacementOrderId        String?[m
[32m+[m[32m  replacementTrackingNumber String?[m
[32m+[m[32m  metadata                  Json?[m
[32m+[m[32m  resolutionData            Json?[m
[32m+[m[32m  resolvedAt                DateTime?[m
[32m+[m[32m  closedAt                  DateTime?[m
[32m+[m[32m  createdAt                 DateTime              @default(now())[m
[32m+[m[32m  updatedAt                 DateTime              @updatedAt[m
[32m+[m[32m  deletedAt                 DateTime?[m
[32m+[m[32m  isDeleted                 Boolean               @default(false)[m
[32m+[m[32m  aiJob                     AIJob?                @relation(fields: [aiJobId], references: [id])[m
[32m+[m[32m  assignee                  User?                 @relation("ReturnAssignedTo", fields: [assignedTo], references: [id])[m
[32m+[m[32m  claim                     Claim?                @relation(fields: [claimId], references: [id])[m
[32m+[m[32m  company                   Company               @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  evidence                  Evidence?             @relation(fields: [evidenceId], references: [id])[m
[32m+[m[32m  order                     Order                 @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  recording                 RecordingSession?     @relation(fields: [recordingId], references: [id])[m
[32m+[m[32m  resolver                  User?                 @relation("ReturnResolvedBy", fields: [resolvedBy], references: [id])[m
[32m+[m[32m  warehouse                 Warehouse             @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@index([priority])[m
[32m+[m[32m  @@map("returns")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Scanner {[m
[32m+[m[32m  id          String           @id @default(uuid())[m
[32m+[m[32m  companyId   String[m
[32m+[m[32m  warehouseId String[m
[32m+[m[32m  orderId     String[m
[32m+[m[32m  sessionId   String[m
[32m+[m[32m  evidenceId  String?[m
[32m+[m[32m  scannedBy   String[m
[32m+[m[32m  verifiedBy  String?[m
[32m+[m[32m  barcode     String[m
[32m+[m[32m  barcodeType String[m
[32m+[m[32m  status      ScanStatus       @default(PENDING)[m
[32m+[m[32m  location    Json?[m
[32m+[m[32m  device      Json?[m
[32m+[m[32m  result      Json?[m
[32m+[m[32m  statistics  Json?[m
[32m+[m[32m  remarks     String?[m
[32m+[m[32m  scannedAt   DateTime         @default(now())[m
[32m+[m[32m  verifiedAt  DateTime?[m
[32m+[m[32m  createdAt   DateTime         @default(now())[m
[32m+[m[32m  updatedAt   DateTime         @updatedAt[m
[32m+[m[32m  deletedAt   DateTime?[m
[32m+[m[32m  isDeleted   Boolean          @default(false)[m
[32m+[m[32m  company     Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  evidence    Evidence?        @relation(fields: [evidenceId], references: [id])[m
[32m+[m[32m  order       Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  operator    User             @relation("ScanScannedBy", fields: [scannedBy], references: [id])[m
[32m+[m[32m  recording   RecordingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  verifier    User?            @relation("ScanVerifiedBy", fields: [verifiedBy], references: [id])[m
[32m+[m[32m  warehouse   Warehouse        @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([orderId])[m
[32m+[m[32m  @@index([sessionId])[m
[32m+[m[32m  @@index([barcode])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@map("scans")[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel Report {[m
[32m+[m[32m  id           String       @id @default(uuid())[m
[32m+[m[32m  companyId    String[m
[32m+[m[32m  warehouseId  String?[m
[32m+[m[32m  generatedBy  String[m
[32m+[m[32m  reportType   String[m
[32m+[m[32m  reportName   String[m
[32m+[m[32m  description  String?[m
[32m+[m[32m  status       ReportStatus @default(PENDING)[m
[32m+[m[32m  dateRange    Json?[m
[32m+[m[32m  summary      Json?[m
[32m+[m[32m  kpi          Json?[m
[32m+[m[32m  exportFormat String?[m
[32m+[m[32m  downloadUrl  String?[m
[32m+[m[32m  isScheduled  Boolean      @default(false)[m
[32m+[m[32m  scheduleCron String?[m
[32m+[m[32m  createdAt    DateTime     @default(now())[m
[32m+[m[32m  updatedAt    DateTime     @updatedAt[m
[32m+[m[32m  deletedAt    DateTime?[m
[32m+[m[32m  isDeleted    Boolean      @default(false)[m
[32m+[m[32m  company      Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[32m+[m[32m  generator    User         @relation("ReportGeneratedBy", fields: [generatedBy], references: [id])[m
[32m+[m[32m  warehouse    Warehouse?   @relation(fields: [warehouseId], references: [id])[m
[32m+[m
[32m+[m[32m  @@index([companyId])[m
[32m+[m[32m  @@index([warehouseId])[m
[32m+[m[32m  @@index([reportType])[m
[32m+[m[32m  @@index([status])[m
[32m+[m[32m  @@map("reports")[m
[32m+[m[32m}[m
 [m
 enum CompanyStatus {[m
   ACTIVE[m
[36m@@ -257,717 +827,3 @@[m [menum ReportStatus {[m
   FAILED[m
   CANCELLED[m
 }[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Core models[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Company {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  /// Primary business code (also exposed as companyCode in richer modules)[m
[31m-  code  String         @unique @db.VarChar(30)[m
[31m-  name  String         @db.VarChar(150)[m
[31m-  email String?        @unique @db.VarChar(150)[m
[31m-  phone String?        @db.VarChar(20)[m
[31m-  status CompanyStatus @default(ACTIVE)[m
[31m-[m
[31m-  /// Optional rich-module fields (companies/ module)[m
[31m-  legalName     String? @db.VarChar(200)[m
[31m-  companyType   String? @db.VarChar(50)[m
[31m-  gstNumber     String? @db.VarChar(30)[m
[31m-  panNumber     String? @db.VarChar(20)[m
[31m-  emailVerified Boolean @default(false)[m
[31m-  phoneVerified Boolean @default(false)[m
[31m-  blockReason   String?[m
[31m-  blockedAt     DateTime?[m
[31m-[m
[31m-  address      Json?[m
[31m-  contact      Json?[m
[31m-  branding     Json?[m
[31m-  subscription Json?[m
[31m-  settings     Json?[m
[31m-  storage      Json?[m
[31m-[m
[31m-  users         User[][m
[31m-  warehouses    Warehouse[][m
[31m-  orders        Order[][m
[31m-  recordings    RecordingSession[][m
[31m-  evidences     Evidence[][m
[31m-  uploads       Upload[][m
[31m-  aiJobs        AIJob[][m
[31m-  notifications Notification[][m
[31m-  claims        Claim[][m
[31m-  returns       Return[][m
[31m-  scanners      Scanner[][m
[31m-  reports       Report[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([gstNumber])[m
[31m-  @@index([panNumber])[m
[31m-  @@map("companies")[m
[31m-}[m
[31m-[m
[31m-model User {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId String[m
[31m-  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-[m
[31m-  firstName String @db.VarChar(100)[m
[31m-  lastName  String @db.VarChar(100)[m
[31m-  email     String @unique @db.VarChar(150)[m
[31m-[m
[31m-  /// Rich users/ module fields[m
[31m-  username     String? @unique @db.VarChar(100)[m
[31m-  employeeCode String? @db.VarChar(50)[m
[31m-[m
[31m-  passwordHash     String[m
[31m-  refreshTokenHash String?[m
[31m-[m
[31m-  role   UserRole   @default(OPERATOR)[m
[31m-  status UserStatus @default(PENDING)[m
[31m-[m
[31m-  lastLoginAt       DateTime?[m
[31m-  passwordChangedAt DateTime?[m
[31m-[m
[31m-  profile     Json?[m
[31m-  assignment  Json?[m
[31m-  permissions Json?[m
[31m-  statistics  Json?[m
[31m-[m
[31m-  emailVerified    Boolean @default(false)[m
[31m-  phoneVerified    Boolean @default(false)[m
[31m-  twoFactorEnabled Boolean @default(false)[m
[31m-[m
[31m-  ordersCreated     Order[]            @relation("OrderCreatedBy")[m
[31m-  recordings        RecordingSession[] @relation("RecordingOperator")[m
[31m-  notifications     Notification[][m
[31m-  claimsAssigned    Claim[]            @relation("ClaimAssignedTo")[m
[31m-  claimsResolved    Claim[]            @relation("ClaimResolvedBy")[m
[31m-  returnsAssigned   Return[]           @relation("ReturnAssignedTo")[m
[31m-  returnsResolved   Return[]           @relation("ReturnResolvedBy")[m
[31m-  scansScanned      Scanner[]          @relation("ScanScannedBy")[m
[31m-  scansVerified     Scanner[]          @relation("ScanVerifiedBy")[m
[31m-  reportsGenerated  Report[]           @relation("ReportGeneratedBy")[m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([email])[m
[31m-  @@index([username])[m
[31m-  @@index([employeeCode])[m
[31m-  @@map("users")[m
[31m-}[m
[31m-[m
[31m-model Warehouse {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId String[m
[31m-  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-[m
[31m-  code        String  @db.VarChar(30)[m
[31m-  name        String  @db.VarChar(150)[m
[31m-  description String? @db.VarChar(500)[m
[31m-[m
[31m-  /// Flat address fields (lean warehouse module)[m
[31m-  address String? @db.VarChar(500)[m
[31m-  city    String? @db.VarChar(100)[m
[31m-  state   String? @db.VarChar(100)[m
[31m-  country String? @db.VarChar(100)[m
[31m-  pincode String? @db.VarChar(20)[m
[31m-  phone   String? @db.VarChar(20)[m
[31m-  email   String? @db.VarChar(150)[m
[31m-  isActive Boolean @default(true)[m
[31m-[m
[31m-  /// Rich warehouses/ module fields[m
[31m-  warehouseType  String? @db.VarChar(50)[m
[31m-  status         String? @db.VarChar(30)[m
[31m-  timezone       String? @db.VarChar(50)[m
[31m-  operatingHours String?[m
[31m-  contactEmail   String? @db.VarChar(150)[m
[31m-  contactPhone   String? @db.VarChar(30)[m
[31m-  isDefault      Boolean @default(false)[m
[31m-[m
[31m-  addressJson Json? /// structured address object[m
[31m-  location    Json?[m
[31m-  manager     Json?[m
[31m-  capacity    Json?[m
[31m-[m
[31m-  orders     Order[][m
[31m-  recordings RecordingSession[][m
[31m-  evidences  Evidence[][m
[31m-  uploads    Upload[][m
[31m-  aiJobs     AIJob[][m
[31m-  claims     Claim[][m
[31m-  returns    Return[][m
[31m-  scanners   Scanner[][m
[31m-  reports    Report[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@unique([companyId, code])[m
[31m-  @@index([companyId])[m
[31m-  @@index([name])[m
[31m-  @@map("warehouses")[m
[31m-}[m
[31m-[m
[31m-model Order {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  createdById String[m
[31m-[m
[31m-  company   Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  createdBy User      @relation("OrderCreatedBy", fields: [createdById], references: [id])[m
[31m-[m
[31m-  marketplace           Marketplace[m
[31m-  marketplaceOrderId    String? @db.VarChar(100)[m
[31m-  marketplaceShipmentId String? @db.VarChar(100)[m
[31m-[m
[31m-  orderNumber   String  @db.VarChar(100)[m
[31m-  awbNumber     String? @db.VarChar(100)[m
[31m-  customerName  String? @db.VarChar(150)[m
[31m-  customerPhone String? @db.VarChar(30)[m
[31m-[m
[31m-  status             OrderStatus        @default(CREATED)[m
[31m-  packingStatus      PackingStatus      @default(PENDING)[m
[31m-  verificationStatus VerificationStatus @default(PENDING)[m
[31m-  priority           OrderPriority      @default(MEDIUM)[m
[31m-[m
[31m-  expectedItemCount Int @default(0)[m
[31m-  verifiedItemCount Int @default(0)[m
[31m-[m
[31m-  /// Rich orders/ module fields[m
[31m-  customerId     String?[m
[31m-  assignedTo     String?[m
[31m-  trackingNumber String? @db.VarChar(100)[m
[31m-  courier        String? @db.VarChar(100)[m
[31m-  recordingId    String?[m
[31m-  evidenceId     String?[m
[31m-  claimId        String?[m
[31m-  returnId       String?[m
[31m-  remarks        String?[m
[31m-[m
[31m-  items           Json?[m
[31m-  customer        Json?[m
[31m-  shippingAddress Json?[m
[31m-  metadata        Json?[m
[31m-[m
[31m-  recordings RecordingSession[][m
[31m-  evidences  Evidence[][m
[31m-  uploads    Upload[][m
[31m-  aiJobs     AIJob[][m
[31m-  claims     Claim[][m
[31m-  returns    Return[][m
[31m-  scanners   Scanner[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([createdById])[m
[31m-  @@index([status])[m
[31m-  @@index([packingStatus])[m
[31m-  @@index([priority])[m
[31m-  @@index([marketplace])[m
[31m-  @@index([orderNumber])[m
[31m-  @@index([awbNumber])[m
[31m-  @@index([assignedTo])[m
[31m-  @@index([customerId])[m
[31m-  @@map("orders")[m
[31m-  @@unique([companyId, marketplace, marketplaceOrderId])[m
[31m-}[m
[31m-[m
[31m-model RecordingSession {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String[m
[31m-  operatorId  String[m
[31m-[m
[31m-  company   Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  operator  User      @relation("RecordingOperator", fields: [operatorId], references: [id], onDelete: Cascade)[m
[31m-[m
[31m-  status RecordingStatus @default(CREATED)[m
[31m-[m
[31m-  startedAt DateTime?[m
[31m-  pausedAt  DateTime?[m
[31m-  resumedAt DateTime?[m
[31m-  stoppedAt DateTime?[m
[31m-[m
[31m-  durationSeconds Int @default(0)[m
[31m-[m
[31m-  localFileName    String?[m
[31m-  originalFileName String?[m
[31m-  fileUrl          String?[m
[31m-  thumbnailUrl     String?[m
[31m-  fileSize         BigInt?[m
[31m-[m
[31m-  evidences Evidence[][m
[31m-  uploads   Upload[][m
[31m-  aiJobs    AIJob[][m
[31m-  claims    Claim[][m
[31m-  returns   Return[][m
[31m-  scanners  Scanner[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([operatorId])[m
[31m-  @@index([status])[m
[31m-  @@map("recording_sessions")[m
[31m-}[m
[31m-[m
[31m-model Evidence {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String[m
[31m-  recordingId String[m
[31m-[m
[31m-  company   Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse         @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  recording RecordingSession  @relation(fields: [recordingId], references: [id], onDelete: Cascade)[m
[31m-[m
[31m-  status EvidenceStatus @default(CREATED)[m
[31m-  type   EvidenceType   @default(PACKING_VIDEO)[m
[31m-[m
[31m-  originalVideoUrl  String?[m
[31m-  processedVideoUrl String?[m
[31m-  thumbnailUrl      String?[m
[31m-[m
[31m-  hash     String?[m
[31m-  checksum String?[m
[31m-[m
[31m-  durationSeconds Int    @default(0)[m
[31m-  fileSize        BigInt?[m
[31m-[m
[31m-  metadata Json?[m
[31m-[m
[31m-  generatedAt DateTime?[m
[31m-  verifiedAt  DateTime?[m
[31m-  archivedAt  DateTime?[m
[31m-[m
[31m-  uploads Upload[][m
[31m-  aiJobs  AIJob[][m
[31m-  claims  Claim[][m
[31m-  returns Return[][m
[31m-  scanners Scanner[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([recordingId])[m
[31m-  @@index([status])[m
[31m-  @@map("evidence")[m
[31m-}[m
[31m-[m
[31m-model Upload {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String?[m
[31m-  recordingId String?[m
[31m-  evidenceId  String?[m
[31m-[m
[31m-  company   Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse          @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order?             @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  recording RecordingSession?  @relation(fields: [recordingId], references: [id], onDelete: Cascade)[m
[31m-  evidence  Evidence?          @relation(fields: [evidenceId], references: [id], onDelete: Cascade)[m
[31m-[m
[31m-  originalName String[m
[31m-  fileName     String[m
[31m-  storageKey   String @unique[m
[31m-  bucket       String[m
[31m-  provider     String[m
[31m-  mimeType     String[m
[31m-  extension    String[m
[31m-[m
[31m-  category   UploadCategory[m
[31m-  visibility UploadVisibility @default(PRIVATE)[m
[31m-  status     UploadStatus     @default(PENDING)[m
[31m-[m
[31m-  size     BigInt  @default(0)[m
[31m-  checksum String?[m
[31m-  hash     String?[m
[31m-  etag     String?[m
[31m-  metadata Json?[m
[31m-[m
[31m-  uploadedAt DateTime?[m
[31m-  expiresAt  DateTime?[m
[31m-[m
[31m-  aiJobs AIJob[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([recordingId])[m
[31m-  @@index([evidenceId])[m
[31m-  @@index([status])[m
[31m-  @@index([category])[m
[31m-  @@index([storageKey])[m
[31m-  @@map("uploads")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// AI[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model AIJob {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String?[m
[31m-  uploadId    String?[m
[31m-  recordingId String?[m
[31m-  evidenceId  String?[m
[31m-[m
[31m-  company   Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse          @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order?             @relation(fields: [orderId], references: [id], onDelete: SetNull)[m
[31m-  upload    Upload?            @relation(fields: [uploadId], references: [id], onDelete: SetNull)[m
[31m-  recording RecordingSession?  @relation(fields: [recordingId], references: [id], onDelete: SetNull)[m
[31m-  evidence  Evidence?          @relation(fields: [evidenceId], references: [id], onDelete: SetNull)[m
[31m-[m
[31m-  provider AIProvider[m
[31m-  model    String[m
[31m-  jobType  String[m
[31m-  status   AIJobStatus @default(PENDING)[m
[31m-[m
[31m-  prompt String[m
[31m-  input  Json[m
[31m-  output Json?[m
[31m-[m
[31m-  confidence     Float  @default(0)[m
[31m-  tokensUsed     Int?[m
[31m-  processingTime Int?[m
[31m-  error          String?[m
[31m-[m
[31m-  startedAt   DateTime?[m
[31m-  completedAt DateTime?[m
[31m-  metadata    Json?[m
[31m-[m
[31m-  claims  Claim[][m
[31m-  returns Return[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([status])[m
[31m-  @@index([provider])[m
[31m-  @@map("ai_jobs")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Notifications[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Notification {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  userId    String?[m
[31m-  companyId String?[m
[31m-[m
[31m-  user    User?    @relation(fields: [userId], references: [id], onDelete: SetNull)[m
[31m-  company Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)[m
[31m-[m
[31m-  title    String[m
[31m-  body     String[m
[31m-  channel  NotificationChannel[m
[31m-  priority NotificationPriority @default(MEDIUM)[m
[31m-  status   NotificationStatus   @default(PENDING)[m
[31m-[m
[31m-  template          String?[m
[31m-  recipient         String[m
[31m-  subject           String?[m
[31m-  provider          String?[m
[31m-  providerMessageId String?[m
[31m-[m
[31m-  data     Json?[m
[31m-  metadata Json?[m
[31m-[m
[31m-  retryCount Int @default(0)[m
[31m-[m
[31m-  scheduledAt   DateTime?[m
[31m-  sentAt        DateTime?[m
[31m-  deliveredAt   DateTime?[m
[31m-  readAt        DateTime?[m
[31m-  failedAt      DateTime?[m
[31m-  failureReason String?[m
[31m-  expiresAt     DateTime?[m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([userId])[m
[31m-  @@index([status])[m
[31m-  @@index([channel])[m
[31m-  @@map("notifications")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Claims[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Claim {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  claimNumber String @unique @db.VarChar(50)[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String[m
[31m-  recordingId String?[m
[31m-  evidenceId  String?[m
[31m-  aiJobId     String?[m
[31m-  assignedTo  String?[m
[31m-  resolvedBy  String?[m
[31m-[m
[31m-  company   Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse          @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order              @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  recording RecordingSession?  @relation(fields: [recordingId], references: [id], onDelete: SetNull)[m
[31m-  evidence  Evidence?          @relation(fields: [evidenceId], references: [id], onDelete: SetNull)[m
[31m-  aiJob     AIJob?             @relation(fields: [aiJobId], references: [id], onDelete: SetNull)[m
[31m-  assignee  User?              @relation("ClaimAssignedTo", fields: [assignedTo], references: [id], onDelete: SetNull)[m
[31m-  resolver  User?              @relation("ClaimResolvedBy", fields: [resolvedBy], references: [id], onDelete: SetNull)[m
[31m-[m
[31m-  status         ClaimStatus          @default(DRAFT)[m
[31m-  priority       ClaimPriority        @default(MEDIUM)[m
[31m-  resolutionType ClaimResolutionType?[m
[31m-[m
[31m-  title            String[m
[31m-  description      String[m
[31m-  customerRemarks  String?[m
[31m-  internalRemarks  String?[m
[31m-  aiSummary        String?[m
[31m-  aiConfidence     Float   @default(0)[m
[31m-  aiRecommendation String?[m
[31m-[m
[31m-  metadata       Json?[m
[31m-  resolutionData Json?[m
[31m-[m
[31m-  resolvedAt DateTime?[m
[31m-  closedAt   DateTime?[m
[31m-[m
[31m-  returns Return[][m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([status])[m
[31m-  @@index([priority])[m
[31m-  @@map("claims")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Returns[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Return {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  returnNumber String @unique @db.VarChar(50)[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String[m
[31m-  claimId     String?[m
[31m-  recordingId String?[m
[31m-  evidenceId  String?[m
[31m-  aiJobId     String?[m
[31m-  assignedTo  String?[m
[31m-  resolvedBy  String?[m
[31m-[m
[31m-  company   Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse          @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order              @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  claim     Claim?             @relation(fields: [claimId], references: [id], onDelete: SetNull)[m
[31m-  recording RecordingSession?  @relation(fields: [recordingId], references: [id], onDelete: SetNull)[m
[31m-  evidence  Evidence?          @relation(fields: [evidenceId], references: [id], onDelete: SetNull)[m
[31m-  aiJob     AIJob?             @relation(fields: [aiJobId], references: [id], onDelete: SetNull)[m
[31m-  assignee  User?              @relation("ReturnAssignedTo", fields: [assignedTo], references: [id], onDelete: SetNull)[m
[31m-  resolver  User?              @relation("ReturnResolvedBy", fields: [resolvedBy], references: [id], onDelete: SetNull)[m
[31m-[m
[31m-  status         ReturnStatus          @default(DRAFT)[m
[31m-  priority       ReturnPriority        @default(MEDIUM)[m
[31m-  resolutionType ReturnResolutionType?[m
[31m-[m
[31m-  marketplace           String[m
[31m-  marketplaceReturnId   String?[m
[31m-[m
[31m-  title           String[m
[31m-  description     String[m
[31m-  customerReason  String?[m
[31m-  internalRemarks String?[m
[31m-[m
[31m-  aiSummary        String?[m
[31m-  aiConfidence     Float  @default(0)[m
[31m-  aiRecommendation String?[m
[31m-[m
[31m-  refundAmount               Float?[m
[31m-  refundCurrency             String?[m
[31m-  replacementOrderId         String?[m
[31m-  replacementTrackingNumber  String?[m
[31m-[m
[31m-  metadata       Json?[m
[31m-  resolutionData Json?[m
[31m-[m
[31m-  resolvedAt DateTime?[m
[31m-  closedAt   DateTime?[m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([status])[m
[31m-  @@index([priority])[m
[31m-  @@map("returns")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Scanner (barcode scans) — model name Scanner → prisma.scanner[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Scanner {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String[m
[31m-  orderId     String[m
[31m-  sessionId   String[m
[31m-  evidenceId  String?[m
[31m-  scannedBy   String[m
[31m-  verifiedBy  String?[m
[31m-[m
[31m-  company   Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse         @relation(fields: [warehouseId], references: [id], onDelete: Cascade)[m
[31m-  order     Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)[m
[31m-  recording RecordingSession? @relation(fields: [sessionId], references: [id], onDelete: Cascade)[m
[31m-  evidence  Evidence?         @relation(fields: [evidenceId], references: [id], onDelete: SetNull)[m
[31m-  operator  User              @relation("ScanScannedBy", fields: [scannedBy], references: [id])[m
[31m-  verifier  User?             @relation("ScanVerifiedBy", fields: [verifiedBy], references: [id], onDelete: SetNull)[m
[31m-[m
[31m-  barcode     String[m
[31m-  barcodeType String[m
[31m-  status      ScanStatus @default(PENDING)[m
[31m-[m
[31m-  location   Json?[m
[31m-  device     Json?[m
[31m-  result     Json?[m
[31m-  statistics Json?[m
[31m-[m
[31m-  remarks String?[m
[31m-[m
[31m-  scannedAt  DateTime  @default(now())[m
[31m-  verifiedAt DateTime?[m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([orderId])[m
[31m-  @@index([sessionId])[m
[31m-  @@index([barcode])[m
[31m-  @@index([status])[m
[31m-  @@map("scans")[m
[31m-}[m
[31m-[m
[31m-// ------------------------------------------------------[m
[31m-// Reports[m
[31m-// ------------------------------------------------------[m
[31m-[m
[31m-model Report {[m
[31m-  id String @id @default(uuid())[m
[31m-[m
[31m-  companyId   String[m
[31m-  warehouseId String?[m
[31m-  generatedBy String[m
[31m-[m
[31m-  company   Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)[m
[31m-  warehouse Warehouse? @relation(fields: [warehouseId], references: [id], onDelete: SetNull)[m
[31m-  generator User       @relation("ReportGeneratedBy", fields: [generatedBy], references: [id])[m
[31m-[m
[31m-  reportType  String[m
[31m-  reportName  String[m
[31m-  description String?[m
[31m-  status      ReportStatus @default(PENDING)[m
[31m-[m
[31m-  dateRange    Json?[m
[31m-  summary      Json?[m
[31m-  kpi          Json?[m
[31m-  exportFormat String?[m
[31m-  downloadUrl  String?[m
[31m-[m
[31m-  isScheduled  Boolean @default(false)[m
[31m-  scheduleCron String?[m
[31m-[m
[31m-  createdAt DateTime  @default(now())[m
[31m-  updatedAt DateTime  @updatedAt[m
[31m-  deletedAt DateTime?[m
[31m-  isDeleted Boolean   @default(false)[m
[31m-[m
[31m-  @@index([companyId])[m
[31m-  @@index([warehouseId])[m
[31m-  @@index([reportType])[m
[31m-  @@index([status])[m
[31m-  @@map("reports")[m
[31m-}[m
