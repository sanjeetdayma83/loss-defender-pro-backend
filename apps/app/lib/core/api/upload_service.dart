import 'package:dio/dio.dart';
import 'dart:io';

class UploadService {
  /// Uploads actual video file directly to Backblaze B2/S3 using Presigned URL
  static Future<bool> uploadVideoToS3(String presignedUrl, File videoFile) async {
    try {
      final dio = Dio();
      final length = await videoFile.length();
      
      final response = await dio.put(
        presignedUrl,
        data: videoFile.openRead(),
        options: Options(
          headers: {
            Headers.contentLengthHeader: length,
            'Content-Type': 'video/mp4', // Security requirement for AWS S3 Signature
          },
        ),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('S3 Video Upload Failed: \');
      return false;
    }
  }
}
