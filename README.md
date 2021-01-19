# SLAM User Guide

# Quick Start Guide

### Create new project.

![layers](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe4a10ab0-6490-4c80-bb9d-777102dfff82%2Fui_layers.png?table=block&id=6e73d0d3-47d7-4a32-8472-04769a63eabc&width=5000&userId=c2d29741-1a3a-46ba-a21d-e17396bf5cae&cache=v2)

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
