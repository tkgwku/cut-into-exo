package org.oiran.jar.AviUtlTool;

import java.awt.Color;

import javax.swing.JLabel;

public class StatusBar extends JLabel {
	public StatusBar() {
		super();
		setText("");
		setOpaque(true);
		setBounds(0, 0, 200, 16);
	}

	public void setComponentMessage(String key, Status status) {
		setText(App.LANG.get(key));
		setForeground(status.getColor());
	}
}

enum Status {
	SUCESS("#888888"),
	ERROR("#bf1616");

	private final String colorCode;

	Status(String colorCode) {
		this.colorCode = colorCode;
	}

	public Color getColor() {
		return Color.decode(this.colorCode);
	}
}