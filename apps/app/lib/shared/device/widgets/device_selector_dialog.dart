import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

class DeviceSelectorDialog extends StatelessWidget {
  final List<CameraDescription> cameras;
  final CameraDescription? selected;
  final ValueChanged<CameraDescription> onSelected;

  const DeviceSelectorDialog({
    super.key,
    required this.cameras,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select Camera'),
      content: SizedBox(
        width: 420,
        child: cameras.isEmpty
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('No camera detected'),
                ),
              )
            : ListView.separated(
                shrinkWrap: true,
                itemCount: cameras.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final camera = cameras[index];

                  final selectedCamera = selected?.name == camera.name;

                  return ListTile(
                    leading: Icon(
                      Icons.videocam,
                      color: selectedCamera ? Colors.green : Colors.grey,
                    ),
                    title: Text(
                      camera.name.isEmpty ? 'Camera ${index + 1}' : camera.name,
                    ),
                    subtitle: Text(camera.lensDirection.name.toUpperCase()),
                    trailing: selectedCamera
                        ? const Icon(Icons.check_circle, color: Colors.green)
                        : null,
                    onTap: () {
                      onSelected(camera);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
      ),
    );
  }
}
