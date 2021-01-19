# SLAM User Guide

# Quick Start Guide

### Create new project.

![SLAM%20User%20Guide%206e73d0d347d74a32847204769a63eabc/ui_layers.png](SLAM%20User%20Guide%206e73d0d347d74a32847204769a63eabc/ui_layers.png)

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

[FAQ](https://www.notion.so/FAQ-901a1ca2fdec4f548caffc23c79afdcd)