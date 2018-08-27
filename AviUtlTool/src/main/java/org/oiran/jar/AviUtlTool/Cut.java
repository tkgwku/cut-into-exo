package org.oiran.jar.AviUtlTool;

public class Cut {
	int startFrame, endFrame, videoStartFrame;

	public Cut(int startFrame, int endFrame, int videoStartFrame) {
		this.startFrame = startFrame;
		this.endFrame = endFrame;
		this.videoStartFrame = videoStartFrame;
	}

	int length() {
		return this.endFrame - this.startFrame + 1;
	}
}