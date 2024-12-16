/**
 * 
 */
package wsb.sp_pwgp.tablica;

import java.awt.*;
import java.awt.event.*;
import java.io.File;
import java.io.IOException;
import javax.swing.*;
/**
 * @author kmi
 */
@SuppressWarnings("serial")
public class IBClientView extends Frame {
	
	private IBClientController controller = null;
	
    private IBClientModel model = null;

    private Choice colorPicker;

    public IBClientView(IBClientController controller, IBClientModel model, String title) {
    	super(title);
    	this.controller = controller;
    	this.model = model;
    }

    public void createView(int colorIndex, int width, int height) {
        model.createModel(IBProtocol.colors[colorIndex], width, height);
        setBackground(Color.lightGray);
        setLayout(new BorderLayout());


        add(model, "West");


        Button clearButton = new Button("clear");
        clearButton.addActionListener((evt) -> model.clear());
        Panel p100 = new Panel();
        p100.add(clearButton);

        Button saveButton = new Button("Save Drawing");
        saveButton.addActionListener((evt) -> saveDrawing());
        Panel p150 = new Panel();
        p150.add(saveButton);

        Button logoutButton = new Button("logout");
        logoutButton.addActionListener((event) -> controller.forceLogout());
        Panel p200 = new Panel();
        p200.add(logoutButton);


        colorPicker = new Choice();
        String[] colorNames = {"Black", "Blue", "Cyan", "Green", "Violet","Orange", "Pink", "Red", "Yellow"};
        for (int i = 0; i < IBProtocol.colors.length; i++) {
            colorPicker.add(colorNames[i]);
        }
        colorPicker.select(colorIndex);
        colorPicker.addItemListener((event) -> {
            int selectedIndex = colorPicker.getSelectedIndex();
            model.setColor(IBProtocol.colors[selectedIndex]);
        });

        Choice penPicker = new Choice();
        String[] penSizes = {"Thin", "Medium", "Thick"};
        int[] penThickness = {1, 3, 5};
        for (String pen : penSizes) {
            penPicker.add(pen);
        }
        penPicker.select(0);
        penPicker.addItemListener((event) -> {
            int selectedIndex = penPicker.getSelectedIndex();
            model.setPenThickness(penThickness[selectedIndex]);
        });


        Panel colorPanel = new Panel();
        colorPanel.add(new Label("Color:"));
        colorPanel.add(colorPicker);

        Panel penPanel = new Panel();
        penPanel.add(new Label("Pen:"));
        penPanel.add(penPicker);


        Panel p300 = new Panel(new BorderLayout());
        p300.add(p100, "North");
        p300.add(p150, "Center");
        p300.add(p200, "South");

        Panel controlsPanel = new Panel(new BorderLayout());
        controlsPanel.add(p300, "North");
        controlsPanel.add(colorPanel, "Center");
        controlsPanel.add(penPanel, "South");

        add(controlsPanel, "East");
        pack();
        EventQueue.invokeLater(() -> setVisible(true));

        Panel buttonPanel = new Panel(new GridLayout(5, 1));
        add(buttonPanel, BorderLayout.EAST);

        Button freeDrawButton = new Button("Free Draw");
        freeDrawButton.addActionListener((e) -> {
            model.setFreeDrawing(true);
        });
        buttonPanel.add(freeDrawButton);

        Button lineButton = new Button("Draw Line");
        lineButton.addActionListener((e) -> {
            model.setDrawingShape("line");
        });
        buttonPanel.add(lineButton);

        Button rectangleButton = new Button("Draw Rectangle");
        rectangleButton.addActionListener((e) -> {
            model.setDrawingShape("rectangle");
        });
        buttonPanel.add(rectangleButton);

        Button circleButton = new Button("Draw Circle");
        circleButton.addActionListener((e) -> {
            model.setDrawingShape("circle");
        });
        buttonPanel.add(circleButton);


    }
    private void saveDrawing() {
        // Wyświetlenie okna dialogowego do zapisu pliku
        FileDialog fileDialog = new FileDialog(this, "Save Drawing", FileDialog.SAVE);
        fileDialog.setFile("drawing.png"); // Sugerowana nazwa pliku
        fileDialog.setVisible(true);

        String directory = fileDialog.getDirectory();
        String file = fileDialog.getFile();

        if (directory != null && file != null) {
            String filePath = directory + file;
            try {
                model.saveDrawing(filePath); // Wywołanie metody zapisu w modelu
                JOptionPane.showMessageDialog(this, "Drawing saved successfully to:\n" + filePath,
                        "Success", JOptionPane.INFORMATION_MESSAGE);
            } catch (Exception e) { // Obsługujemy ogólny wyjątek, jeżeli coś pójdzie nie tak
                JOptionPane.showMessageDialog(this, "Error saving drawing:\n" + e.getMessage(),
                        "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }


    public void updateTitle(String updateString) {
    	EventQueue.invokeLater(() -> setTitle(getTitle() + ":c" + updateString));
    }
    
    public void drawLine(int color, int x1, int y1, int x2, int y2) { 
    	model.drawLine(IBProtocol.colors[color], x1, y1, x2, y2);
    }
    
    @Override
    public void dispose() {
    	setVisible(false);
    	super.dispose();
    }
}
