package wsb.sp_pwgp.tablica;

import java.awt.*;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

/**
 * @author kmi
 */
@SuppressWarnings("serial")
class IBClientModel extends Canvas implements MouseMotionListener, MouseListener {
    private IBClientController controller = null;

    private Image offImage = null;
    private Graphics offGraphics = null;
    private Color color = null;
    private int mouseCurrentX = 0, mouseCurrentY = 0;
    private int penThickness = 1;
    private boolean isDrawingShape = false;
    private String currentShape = "line";
    private int startX, startY;
    private int previewX, previewY;
    private boolean freeDrawing = false;
    private String drawingShape = null;
    private boolean drawingActive = false;
    private boolean isPreviewActive = false;

    IBClientModel(IBClientController controller) {
        this.controller = controller;
    }

    public void createModel(Color color, int width, int height) {
        this.color = color;
        setSize(width, height);
        addMouseListener(this);
        addMouseMotionListener(this);
    }
    public void setDrawingShape(String shape) {
        this.drawingShape = shape;
        this.freeDrawing = false;
        drawingActive = false;
    }


    public void setColor(Color newColor) {
        this.color = newColor;
    }
    public void setPenThickness(int thickness) {
        this.penThickness = thickness;
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
        startX = 0;
        startY = 0;
        previewX = 0;
        previewY = 0;
        isPreviewActive = false;
        isDrawingShape = false;
    }

    synchronized void drawLine(Color c, int x1, int y1, int x2, int y2) {
        EventQueue.invokeLater(() -> {
            offGraphics.setColor(c);
            Graphics2D g2d = (Graphics2D) offGraphics;
            g2d.setStroke(new BasicStroke(penThickness));
            g2d.drawLine(x1, y1, x2, y2);
            repaint();
        });
    }

    @Override
    public void mouseMoved(MouseEvent me) {
    }

    @Override
    public void mouseDragged(MouseEvent me) {
        if (freeDrawing) {
            int tempX = mouseCurrentX;
            int tempY = mouseCurrentY;
            mouseCurrentX = me.getX();
            mouseCurrentY = me.getY();
            drawLine(color, tempX, tempY, mouseCurrentX, mouseCurrentY);
        } else if (isPreviewActive) {
            previewX = me.getX();
            previewY = me.getY();
            repaint();
        }
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
        startX = me.getX();
        startY = me.getY();
        drawingActive = true;

        if (freeDrawing) {
            mouseCurrentX = startX;
            mouseCurrentY = startY;
        }
    }

    @Override
    public void mouseReleased(MouseEvent me) {
        if (!drawingActive) return;

        int endX = me.getX();
        int endY = me.getY();

        if (drawingShape != null) {
            switch (drawingShape) {
                case "line":
                    drawLine(color, startX, startY, endX, endY);
                    break;
                case "rectangle":
                    drawRectangle(color, startX, startY, endX, endY);
                    break;
                case "circle":
                    drawCircle(color, startX, startY, endX, endY);
                    break;
            }
        }
        drawingActive = false;
    }
    private void drawRectangle(Color c, int x1, int y1, int x2, int y2) {
        int x = Math.min(x1, x2);
        int y = Math.min(y1, y2);
        int width = Math.abs(x1 - x2);
        int height = Math.abs(y1 - y2);

        offGraphics.setColor(c);
        offGraphics.drawRect(x, y, width, height);
        repaint();
    }

    private void drawCircle(Color c, int x1, int y1, int x2, int y2) {
        int x = Math.min(x1, x2);
        int y = Math.min(y1, y2);
        int diameter = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));

        offGraphics.setColor(c);
        offGraphics.drawOval(x, y, diameter, diameter);
        repaint();
    }

    @Override
    public void update(Graphics g) {
        paint(g);
    }
    public void setFreeDrawing(boolean freeDrawing) {
        this.freeDrawing = freeDrawing;
        this.drawingShape = null;
        drawingActive = false;
    }

    @Override
    public void paint(Graphics g) {
        if (offImage != null) {
            g.drawImage(offImage, 0, 0, this);
        }
        if (isPreviewActive) {
            g.setColor(color);
            switch (currentShape) {
                case "line":
                    g.drawLine(startX, startY, previewX, previewY);
                    break;
                case "rectangle":
                    int x = Math.min(startX, previewX);
                    int y = Math.min(startY, previewY);
                    int width = Math.abs(previewX - startX);
                    int height = Math.abs(previewY - startY);
                    g.drawRect(x, y, width, height);
                    break;
                case "circle":
                    x = Math.min(startX, previewX);
                    y = Math.min(startY, previewY);
                    int diameter = Math.max(Math.abs(previewX - startX), Math.abs(previewY - startY));
                    g.drawOval(x, y, diameter, diameter);
                    break;
            }
        }
    }

    @Override
    public String toString() {
        return "client, currentMouseX=" + mouseCurrentX + ", mouseCurrentY=" + mouseCurrentY;
    }
    public void saveDrawing(String filePath) {
        int width = getBounds().width;
        int height = getBounds().height;

        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics g = bufferedImage.getGraphics();
        g.drawImage(offImage, 0, 0, this);
        g.dispose();
        try {
            ImageIO.write(bufferedImage, "png", new File(filePath));
            System.out.println("Rysunek zapisany jako: " + filePath);
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Błąd podczas zapisywania rysunku.");
        }
    }
}