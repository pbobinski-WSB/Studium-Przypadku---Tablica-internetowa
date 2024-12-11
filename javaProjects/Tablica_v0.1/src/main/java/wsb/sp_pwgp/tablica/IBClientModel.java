package wsb.sp_pwgp.tablica;

import java.awt.Canvas;
import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;

/**
 * @author kmi
 */
@SuppressWarnings("serial")
class IBClientModel extends Canvas implements MouseMotionListener,
        MouseListener {
    private IBClientController controller = null;

    private Image offImage = null;
    private Graphics offGraphics = null;
    private Color color = null;
    private int mouseCurrentX = 0, mouseCurrentY = 0;
    private boolean isEraserActive = false;  // flaga trybu gumki


    IBClientModel(IBClientController controller) {
    	this.controller = controller;
    }

    public void createModel(Color color, int width, int height) {
        this.color = color;
        setSize(width, height);
        addMouseListener(this);
        addMouseMotionListener(this);
    }

    @Override
    public void addNotify() {
        super.addNotify();
        offImage = createImage(getBounds().width, getBounds().height);
        offGraphics = offImage.getGraphics();
        clear();
    }

    void clear() {
        int width = getBounds().width, height = getBounds().height;
        offGraphics.clearRect(0, 0, width, height);
        offGraphics.setColor(Color.red);
        offGraphics.drawRect(0, 0, width - 1, height - 1);
        repaint();
    }

    // Metoda przełączająca tryb gumki
    public void toggleEraser() {
        isEraserActive = !isEraserActive;
    }


    synchronized void drawLine(Color c, int x1, int y1, int x2, int y2) {
        EventQueue.invokeLater(() -> {
            if (isEraserActive) {
                offGraphics.setColor(getBackground());  // kolor tła
            } else {
                offGraphics.setColor(c);  // normalny kolor rysowania
            }
            offGraphics.drawLine(x1, y1, x2, y2);
            repaint();
        });
    }


    @Override
    public void mouseMoved(MouseEvent me) {
    }

    @Override
    public void mouseDragged(MouseEvent me) {
    	int tempX = mouseCurrentX;
    	int tempY = mouseCurrentY;
    	mouseCurrentX = me.getX();
    	mouseCurrentY = me.getY();
    	drawLine(color, tempX, tempY, mouseCurrentX, mouseCurrentY);
        controller.mouseDragged(mouseCurrentX, mouseCurrentY);
    }

    @Override
    public void mouseClicked(MouseEvent me) {
    }

    @Override
    public void mouseEntered(MouseEvent me) {
    }

    @Override
    public void mouseExited(MouseEvent me) {
    }

    @Override
    public void mousePressed(MouseEvent me) {
        controller.mousePressed(
        		mouseCurrentX = me.getX(),
        		mouseCurrentY = me.getY());
    }

    @Override
    public void mouseReleased(MouseEvent me) {
    	int mouseLastX = mouseCurrentX;
    	int mouseLastY = mouseCurrentY;
        drawLine(color,
        		mouseLastX, mouseLastY,
        		mouseCurrentX = me.getX(), mouseCurrentY = me.getY());
        controller.mouseReleased(mouseCurrentX, mouseCurrentY);
    }

    @Override
    public void update(Graphics g) {
        paint(g);
    }

    @Override
    public void paint(Graphics g) {
        if (offImage != null) {
            g.drawImage(offImage, 0, 0, this);
        }
    }

    @Override
    public String toString() {
    	return "client, currentMouseX=" + mouseCurrentX + ", mouseCurrentY=" + mouseCurrentY;
    }

    public boolean isEraserActive() {
    {

    }
        return false;
    }}