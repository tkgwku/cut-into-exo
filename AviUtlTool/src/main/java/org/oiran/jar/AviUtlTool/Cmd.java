package org.oiran.jar.AviUtlTool;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.CodeSource;

public class Cmd {
    public static Process execFfmpeg(String cmdLine) {
        Runtime runtime = Runtime.getRuntime();

        String[] command = {"cmd", "/c", cmdLine};

        File ffmpegBin = null;

        try {
            ffmpegBin = getExternalFile("ffmpeg/bin");
        } catch (URISyntaxException e1) {
            e1.printStackTrace();
        }

        if (ffmpegBin == null || !ffmpegBin.exists()) {
            // not found ffmpeg
            return null;
        }

        Process p;
        try {
            p = runtime.exec(command, null, ffmpegBin);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        return p;
    }

    public static URI getJarURI(Class<?> clazz) {
        CodeSource cs = clazz.getProtectionDomain().getCodeSource();
        try {
            return cs.getLocation().toURI();
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static File getExternalFile(String pathStr) throws URISyntaxException {
        URI jarURI = getJarURI(App.class);

        if (jarURI == null) {
            //URISyntaxException
            return null;
        }

        Path jarPath = Paths.get(jarURI);

        String extPath = ("/"+pathStr).replaceAll("/", File.separator.replace("\\", "\\\\"));

        return new File(jarPath.getParent() + extPath);
    }
}
