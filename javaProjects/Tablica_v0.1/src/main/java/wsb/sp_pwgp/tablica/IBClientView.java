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

    private String clientId;

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


        // Przycisk "eraser"
        Button b = new Button("eraser");
        b.addActionListener((evt) -> model.toggleEraser());  // Przełączanie gumki
        Panel ep150 = new Panel();
        ep150.add(b);

        Button logoutButton = new Button("logout");
        logoutButton.addActionListener((event) -> controller.forceLogout());
        Panel p200 = new Panel();
        p200.add(logoutButton);


        Button colorButton = new Button("Choose Color");
        colorButton.addActionListener((event) -> {

            Color selectedColor = JColorChooser.showDialog(this, "Choose a Color", model.getColor());
            if (selectedColor != null) {
                model.setColor(selectedColor);
            }
        });
        Panel colorPanel = new Panel();
        colorPanel.add(colorButton);

        Choice drawingModePicker;
        drawingModePicker = new Choice();
        String[] drawingModes = {"Free Draw", "Draw Line", "Draw Dashed Line", "Draw Rectangle", "Draw Circle", "Spray"};

        for (String mode : drawingModes) {
            drawingModePicker.add(mode);
        }
        drawingModePicker.select(0);
        drawingModePicker.addItemListener((event) -> {
            String selectedMode = drawingModePicker.getSelectedItem();
            switch (selectedMode) {
                case "Free Draw":
                    model.setFreeDrawing(true);
                    break;
                case "Draw Line":
                    model.setFreeDrawing(false);
                    model.setDrawingShape("line");
                    model.setDrawingStyle("solid");
                    break;
                case "Draw Dashed Line":
                    model.setFreeDrawing(false);
                    model.setDrawingShape("line");
                    model.setDrawingStyle("dashed");
                    break;
                case "Draw Rectangle":
                    model.setFreeDrawing(false);
                    model.setDrawingShape("rectangle");
                    break;
                case "Draw Circle":
                    model.setFreeDrawing(false);
                    model.setDrawingShape("circle");
                    break;
                case "Spray":
                    model.setFreeDrawing(false);
                    model.setDrawingShape("spray");
                    break;
            }
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

        Panel penPanel = new Panel();
        penPanel.add(new Label("Pen:"));
        penPanel.add(penPicker);

        Panel Modepanel = new Panel();
        Modepanel.add(new Label("Mode:"));
        Modepanel.add(drawingModePicker);



        Panel p300 = new Panel(new BorderLayout());
        p300.add(p100, "North");
        p300.add(p150, "Center");
        p300.add(ep150, "East");
        p300.add(p200, "South");

        Panel choice = new Panel(new BorderLayout());
        choice.add(colorPanel, "North");
        choice.add(Modepanel, "Center");
        choice.add(penPanel, "South");
        add(choice, "East");

        Panel controlsPanel = new Panel(new BorderLayout());
        controlsPanel.add(p300, "North");

        controlsPanel.add(choice, "Center");

        add(controlsPanel, "East");

        pack();
        EventQueue.invokeLater(() -> setVisible(true));

    }

    private void openColorChooser() {
        Color selectedColor = JColorChooser.showDialog(this, "Choose a Color", model.getColor());
        if (selectedColor != null) {
            model.setColor(selectedColor);
        }
    }
    private void saveDrawing() {

        FileDialog fileDialog = new FileDialog(this, "Save Drawing", FileDialog.SAVE);
        fileDialog.setFile("drawing.png");
        fileDialog.setVisible(true);

        String directory = fileDialog.getDirectory();
        String file = fileDialog.getFile();

        if (directory != null && file != null) {
            String filePath = directory + file;
            try {
                model.saveDrawing(filePath);
                JOptionPane.showMessageDialog(this, "Drawing saved successfully to:\n" + filePath,
                        "Success", JOptionPane.INFORMATION_MESSAGE);
            } catch (Exception e) {
                JOptionPane.showMessageDialog(this, "Error saving drawing:\n" + e.getMessage(),
                        "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }


    public void updateTitle(String updateString) {
        setClientId(updateString);
        EventQueue.invokeLater(() -> setTitle(getTitle() + ":c" + updateString));
    }

    public void drawObject(int color, int x1, int y1, int x2, int y2, String drawingshape) {
        System.out.println("Client " + getClientId() + " color: " + color );
        model.drawObject(IBProtocol.colors[color], x1, y1, x2, y2, drawingshape);
    }

    @Override
    public void dispose() {
        setVisible(false);
        super.dispose();
    }


    public IBClientModel getModel() {
        return model;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
}
