package org.oiran.jar.AviUtlTool;

import java.awt.BorderLayout;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.dnd.DnDConstants;
import java.awt.dnd.DropTarget;
import java.awt.dnd.DropTargetAdapter;
import java.awt.dnd.DropTargetDropEvent;
import java.awt.event.WindowEvent;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.Arrays;
import java.util.List;
import java.util.Map.Entry;

import javax.swing.JFrame;
import javax.swing.JLabel;

public class App extends JFrame {
    static App instance;
    //static final int nb_thumbnail = 10;
    private StatusBar statusBar;

    public App() {
        setTitle("kiriharikun");
        setSize(320, 180);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        statusBar = new StatusBar();
        getContentPane().add(statusBar, BorderLayout.SOUTH);
    }

    public static void main(String[] args){
        instance = new App();
        DropTarget target = new DropTarget(instance, new VideoDropTargetAdapter());
        instance.setVisible(true);
    }

    public void exit() {
        instance.dispatchEvent(new WindowEvent(instance, WindowEvent.WINDOW_CLOSING));
    }

    public void setStatusMessage(String message) {
        statusBar.setMessage(message);
    }
}
class StatusBar extends JLabel {
    public StatusBar() {
        super();
        super.setPreferredSize(new Dimension(100, 16));
        setMessage("");
    }

    public void setMessage(String message) {
        setText(message);
    }
}
class VideoDropTargetAdapter extends DropTargetAdapter{
    static List<String> vparamToSendList;
    static List<String> aparamToSendList;
    static List<String> fparamToSendList;
    static {
        String[] vstreamParamToSend = {
                "width",
                "height",
                "r_frame_rate",
                "duration",
                "nb_frames"
        };
        String[] astreamParamToSend = {
        		"sample_rate"
        };
        String[] fstreamParamToSend = {
                "size"
        };
        vparamToSendList = Arrays.asList(vstreamParamToSend);
        aparamToSendList = Arrays.asList(astreamParamToSend);
        fparamToSendList = Arrays.asList(fstreamParamToSend);
    }
    public void drop(DropTargetDropEvent dtde) {
        try {
            Transferable transfer = dtde.getTransferable();
            if (transfer.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
                dtde.acceptDrop(DnDConstants.ACTION_COPY_OR_MOVE);
                List<File> fileList = (List<File>) transfer.getTransferData(DataFlavor.javaFileListFlavor);
                if (fileList.size() == 1) {
                    File f = fileList.get(0);
                    if (f.getName().endsWith(".mp4")) {
                        Mp4 mp4 = new Mp4(f);
                        if (mp4.loadMetadata()) {
                            //File ft = new File(getClass().getResource("/html/tn").getPath());
                            //if (mp4.createThumbnails(ft)) {
                            Desktop desktop = Desktop.getDesktop();
                            File fp = Cmd.getExternalFile("html/index.html");
                            File fj = Cmd.getExternalFile("html/data.js");
                            String jsStr = "";
                            String vq = "";
                            for (Entry<String, String> entry : mp4.vstream_metadatas.entrySet()) {
                                if (vparamToSendList.contains(entry.getKey())) {
                                    vq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (vq.length() > 0) {
                            	jsStr += "const JAVA_VIDEO_STREAM = '"+vq.substring(1)+"';";
                            }

                            String aq = "";
                            for (Entry<String, String> entry : mp4.astream_metadatas.entrySet()) {
                                if (aparamToSendList.contains(entry.getKey())) {
                                    aq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (aq.length() > 0) {
                            	jsStr += "const JAVA_AUDIO_STREAM = '"+aq.substring(1)+"';";
                            }

                            String fq = "";
                            for (Entry<String, String> entry : mp4.format_metadatas.entrySet()) {
                                if (fparamToSendList.contains(entry.getKey())) {
                                    fq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (fq.length() > 0) {
                            	jsStr += "const JAVA_FORMAT = '"+fq.substring(1)+"';";
                            }

                            jsStr += "const JAVA_FILE_PATH='"+escape(f.getAbsolutePath())+"';";

                            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(fj), "UTF-8");

                            writer.write(jsStr);
                            writer.close();

                            desktop.browse(fp.toURI());
                            App.instance.exit();
                            //} else {
                            //    System.err.println("failed to create thumbnails");
                            //}
                        } else {
                            System.err.println("failed to load video metadatas");
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public String escape(String s){
        return s.replaceAll("'", "&apos;").replaceAll("\\\\", "\\\\\\\\");
    }
}
