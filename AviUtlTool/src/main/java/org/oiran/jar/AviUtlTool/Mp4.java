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

        Process p = Cmd.execFfmpeg(cmdStr);

        if (p == null) {
            return false;
        }

        InputStream is = p.getInputStream();
        BufferedReader br;
        try {
            br = new BufferedReader(new InputStreamReader(is, "JISAutoDetect"));
        } catch (UnsupportedEncodingException e1) {
            e1.printStackTrace();
            return false;
        }

        vstream_metadatas = new HashMap<String, String>();
        astream_metadatas = new HashMap<String, String>();
        format_metadatas = new HashMap<String, String>();

        int state = -1;

        try {
            while (true) {
                String line = br.readLine();
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
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        if (vstream_metadatas.isEmpty() || astream_metadatas.isEmpty() || format_metadatas.isEmpty()) {
            return false;
        }

        return true;
    }

    /*
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
     */
}
class Metadata<K,V> {
    K key;
    V val;

    public Metadata(K key, V val) {
        this.key = key;
        this.val = val;
    }

    public K getKey() {
        return this.key;
    }

    public V getValue() {
        return this.val;
    }
}