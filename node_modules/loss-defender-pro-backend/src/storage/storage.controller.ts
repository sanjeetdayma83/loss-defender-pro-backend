import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { StorageService, UploadPurpose } from "./storage.service";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { IsIn, IsString, MinLength, MaxLength } from "class-validator";

class PresignUploadDto {
  @IsString() @MinLength(1) @MaxLength(200)
  filename: string;

  @IsString() @MinLength(3) @MaxLength(120)
  contentType: string;

  @IsIn(["evidence", "recording", "profile", "claim"])
  purpose: UploadPurpose;
}

class PresignDownloadDto {
  @IsString() @MinLength(3)
  key: string;
}

@Controller("storage")
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get("status")
  status() {
    return { configured: this.storage.isConfigured() };
  }

  @Post("presign-upload")
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.packing_operator,
    Role.qc_operator,
    Role.claims_executive,
    Role.super_admin,
  )
  presignUpload(@CurrentUser() user: AuthenticatedUser, @Body() dto: PresignUploadDto) {
    return this.storage.getUploadUrl({
      companyId: user.companyId,
      purpose: dto.purpose,
      filename: dto.filename,
      contentType: dto.contentType,
    });
  }

  @Post("presign-download")
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.packing_operator,
    Role.qc_operator,
    Role.claims_executive,
    Role.viewer,
    Role.auditor,
    Role.super_admin,
  )
  presignDownload(@Body() dto: PresignDownloadDto) {
    return this.storage.getDownloadUrl(dto.key);
  }
}