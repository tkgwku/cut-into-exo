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
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.Arrays;
import java.util.List;
import java.util.Map.Entry;

import javax.swing.JFrame;
import javax.swing.JLabel;

public class App extends JFrame {
    static App instance;
    static final int nb_thumbnail = 10;
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
    static List<String> paramToSendList;
    static {
        String[] paramToSend = {
                "width",
                "height",
                "r_frame_rate",
                "duration",
                "nb_frames",
                "filename",
                "size"
        };
        paramToSendList = Arrays.asList(paramToSend);
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
                            File fp = new File(getClass().getResource("/html/index.html").getPath());
                            File fj = new File(getClass().getResource("/html/data.js").getPath());
                            String q = "";
                            for (Entry<String, String> entry : mp4.metadata.entrySet()) {
                                if (paramToSendList.contains(entry.getKey())) {
                                    q += "&" + entry.getKey() + "=" + entry.getValue();
                                }
                            }
                            if (q.length() < 1) {
                                System.err.println("Not enough metadatas");
                                return;
                            }
                            FileWriter fw = new FileWriter(fj);
                            BufferedWriter bw = new BufferedWriter(fw);
                            bw.write("const JAVA_QUERY = '"+escape(q.substring(1))+"'");
                            bw.close();
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
