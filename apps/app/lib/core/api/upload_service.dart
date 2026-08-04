import 'package:dio/dio.dart';
import 'dart:io';

class UploadService {
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
            'Content-Type': 'video/mp4',
          },
        ),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      // ignore: avoid_print
      print('S3 Video Upload Failed: ');
      return false;
    }
  }
}
