# SLAM User Guide

# Quick Start Guide

### Create new project.

![ui_layers](https://eu-central-1-redbull-attachments-upload.geenee.io/attachments/7ca9f99b-92c5-4d74-9db8-c8f92bb1cfc2/fc78aa9b-be37-4fb6-973d-f73d2294aa30/ui_layers.png)

### Add dependencies.

```jsx
"dependencies": {
	...
	"@geenee/sdk-slam": "^1.0.5-alpha",
	...
}
```

### Import `loadWasm` and `slam`.

```jsx
import '@geenee/sdk-slam';
const { slam, loadWasm } = Geenee;
```

### Initialize video stream.

```jsx
onVideoStream(video: HTMLVideoElement) {
	// initialize SLAM here
	...
}
```

### Load and Initialize WebAssembly.

```jsx
loadWasm().then(() => {
	// Initialize slam here
	...
}
```

### Initialize SLAM.

Add event handlers.

```jsx
slam.on('geenee-slam-ready', onSlamReady)
slam.on('geenee-slam-permission-request', onSlamPermissionRequest)
slam.on('geenee-slam-update', onSlamUpdate)
```

Initialize SLAM.

```jsx
slam.initialize(video, CAMERA_FOV)
```

### Wait for SLAM orientation permission request (only for iOS).

```jsx
onSlamPermissionRequest() {
	// show some clickable block here
	...
}
```

### Allow orientation permission (only for iOS).

```jsx
onPermissionRequestClick() {
	// hide block here
	...
	// show native orientation permission dialog
	slam.startImu()
}
```

### Wait for SLAM ready event.

```jsx
onSlamReady() {
	// ready for work
}
```

### Start SLAM experience.

```jsx
onStartClick(e: MouseEvent) {
	const { clientX, clientY } = e;
	slam.start(clientX, clientY, sceneWidth, sceneHeight).then(() => {
		// show 3D object
		...
	}, (error) => {
		// object in wrong position
	})
}
```
