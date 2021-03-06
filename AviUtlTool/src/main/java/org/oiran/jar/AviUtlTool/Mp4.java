package org.oiran.jar.AviUtlTool;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class Mp4 {
	File file;
	Map<String, String> vstream_metadatas;
	Map<String, String> astream_metadatas;
	Map<String, String> format_metadatas;

	public Mp4(File file) {
		this.file = file;
	}

	boolean loadMetadata() {
		Runtime runtime = Runtime.getRuntime();

		String cmdStr = "ffprobe -loglevel quiet -show_format -show_streams \"" + file.getAbsolutePath() + "\"";

		Process p = Cmd.execFFmpeg(cmdStr);
		if (p == null) return false;

		InputStream is = p.getInputStream();
		BufferedReader br;
		try {
			br = new BufferedReader(new InputStreamReader(is, "JISAutoDetect"));
		} catch (UnsupportedEncodingException e) {
			App.message("ErrorFFprobeEncodingUnsupported", Status.ERROR);
			return false;
		}

		vstream_metadatas = new HashMap<String, String>();
		astream_metadatas = new HashMap<String, String>();
		format_metadatas = new HashMap<String, String>();

		int state = -1;

		while (true) {
			String line;
			try {
				line = br.readLine();
			} catch (IOException e) {
				App.message("ErrorFFprobeEncodingUnsupported", Status.ERROR);
				return false;
			}
			if (line == null) {
				break;
			} else {
				if (line.matches("^[^=]+=[^=]+$")) {
					String[] s = line.split("=");
					switch (state) {
					case 0:
						vstream_metadatas.put(s[0], s[1]);
						break;
					case 1:
						astream_metadatas.put(s[0], s[1]);
						break;
					case 2:
						format_metadatas.put(s[0], s[1]);
						break;
					}
				} else if (line.matches("^\\[\\w+\\]$")) {
					state++;
				}
			}
		}

		try {
			br.close();
		} catch (IOException e) {
		}

		if (vstream_metadatas.isEmpty() || astream_metadatas.isEmpty() || format_metadatas.isEmpty()) {
			App.message("ErrorNoMetadata", Status.ERROR);
			return false;
		}

		return true;
	}
}