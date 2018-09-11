package org.oiran.jar.AviUtlTool;

import java.io.File;
import java.io.IOException;

public class Cmd {
	public static Process execFFmpeg(String cmdLine) {
		Runtime runtime = Runtime.getRuntime();

		String[] command = {"cmd", "/c", cmdLine};

		File ffmpegBin = App.RESOURCE.getExternalFile("ffmpeg/bin");

		Process p;
		try {
			p = runtime.exec(command, null, ffmpegBin);
		} catch (IOException e) {
			App.message("ErrorExecuteCmd", Status.ERROR);
			return null;
		}

		return p;
	}
}
