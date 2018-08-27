package org.oiran.jar.AviUtlTool;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Mp4 {
	File file;
	Map<String, String> metadata;

	public Mp4(File file) {
		this.file = file;
	}

	boolean loadMetadata() {
        Runtime runtime = Runtime.getRuntime();

        String[] command = {"cmd", "/c", "ffprobe -loglevel quiet -show_format -show_streams \"" + file.getAbsolutePath() + "\""};

        File cwd = new File(getClass().getResource("/ffmpeg/bin/").getPath());

        Process p;
		try {
			p = runtime.exec(command, null, cwd);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

        InputStream is = p.getInputStream();
        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        metadata = new HashMap<String, String>();

		try {
	        while (true) {
	            String line = br.readLine();
	            if (line == null) {
	                break;
	            } else {
	            	if (line.matches("^[^=]+=[^=]+$")) {
	            		String[] s = line.split("=");
	            		metadata.put(s[0], s[1]);
	            	}
	            }
	        }
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

        if (metadata.isEmpty()) {
        	return false;
        }

        return true;
	}

	boolean createThumbnails(File tnDir) {
		int tn_interval = 0;
		if (this.metadata != null && this.metadata.containsKey("duration")) {
			String durString = this.metadata.get("duration");
			if (durString.matches("^[0-9.]+$")) {
				double sec = Double.parseDouble(durString);
				tn_interval = (int) Math.floor(sec / App.nb_thumbnail);
			}
		}

		if (tn_interval == 0) {
			System.err.println("no duration metadata");
			return false;
		}
		ProcessBuilder pb = new ProcessBuilder(
				"ffmpeg",
				"-i", file.getAbsolutePath(),
				"-vf", "fps=1/" + tn_interval,
				"\""+tnDir.getAbsolutePath() + File.separator + "thumb%03d.jpg\""
				);

		File cwd = new File(getClass().getResource("/ffmpeg/bin/").getPath());

		System.out.println("creating thumnails...");

        try {
        	App.instance.setStatusMessage("creating thumnails...");
        	pb.directory(cwd);
        	Process p = pb.start();
            BufferedReader stdOut = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String s;
            while((s = stdOut.readLine()) != null){
            	System.out.println(s);
            }
        	App.instance.setStatusMessage("");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
	}
}
