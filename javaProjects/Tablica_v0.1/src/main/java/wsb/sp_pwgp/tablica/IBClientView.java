package wsb.sp_pwgp.tablica;

import java.awt.BorderLayout;
import java.awt.Button;
import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Frame;
import java.awt.Panel;

/**
 * @author kmi
 */
@SuppressWarnings("serial")
public class IBClientView extends Frame {

    private IBClientController controller = null;

    private IBClientModel model = null;

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

        // Przycisk "clear"
        Button b = new Button("clear");
        b.addActionListener((evt) -> model.clear());
        Panel p100 = new Panel();
        p100.add(b);

        // Przycisk "eraser"
        b = new Button("eraser");
        b.addActionListener((evt) -> model.toggleEraser());  // Przełączanie gumki
        Panel p150 = new Panel();
        p150.add(b);

        // Przycisk "logout"
        b = new Button("logout");
        b.addActionListener((event) -> controller.forceLogout());
        Panel p200 = new Panel();
        p200.add(b);

        // Panel boczny z trzema przyciskami
        Panel p300 = new Panel(new BorderLayout());
        p300.add(p100, "North");    // Przycisk "clear" na górze
        p300.add(p150, "Center");   // Przycisk "eraser" na środku
        p300.add(p200, "South");    // Przycisk "logout" na dole

        add(p300, "East");
        pack();
        EventQueue.invokeLater(() -> setVisible(true));
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

    // Metoda getModel - dodana dla umożliwienia dostępu do modelu w IBClientController
    public IBClientModel getModel() {
        return model;
    }
}
