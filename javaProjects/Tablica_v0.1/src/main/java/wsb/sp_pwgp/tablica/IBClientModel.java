package wsb.sp_pwgp.tablica;

import java.awt.*;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import java.awt.Point;
import java.awt.geom.AffineTransform;
import java.awt.Graphics2D;
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
    private String drawingStyle = "solid"; // Domyślnie solid
    private int startX, startY;
    private int previewX, previewY;
    private boolean freeDrawing = false;
    private String drawingShape = null;
    private boolean drawingActive = false;
    private boolean isPreviewActive = false;

    private boolean isEraserActive = false;  // flaga trybu gumki
    private int offsetX = 0;
    private int offsetY = 0;


    private static final int SPRAY_RADIUS = 5;
    private static final int SPRAY_DOTS = 20;

    // Rozmiar pojedynczego kafelka (tile)
    private static final int TILE_SIZE = 512;
    // Ilość kafelków w widocznym obszarze
    private static final int VISIBLE_TILES = 3;

    // Bufor dla kafelków renderowanych dynamicznie
    private BufferedImage[][] tileBuffer;

    // Inicjalizacja kafelków
    private void initializeTiles(int canvasWidth, int canvasHeight) {
        int tileCols = (canvasWidth / TILE_SIZE) + 2;  // Dodanie zapasu kafelków
        int tileRows = (canvasHeight / TILE_SIZE) + 2;

        tileBuffer = new BufferedImage[tileCols][tileRows];

        for (int col = 0; col < tileCols; col++) {
            for (int row = 0; row < tileRows; row++) {
                tileBuffer[col][row] = new BufferedImage(
                        TILE_SIZE, TILE_SIZE, BufferedImage.TYPE_INT_RGB
                );
            }
        }
    }

    private boolean isPanning = false;
    private Point lastPanPoint;

    IBClientModel(IBClientController controller) {
        this.controller = controller;
    }

    public void createModel(Color color, int width, int height) {
        this.color = color;
        setSize(width, height);
        addMouseListener(this);
        addMouseMotionListener(this);
        initializeTiles(width, height);  // Inicjalizacja kafelków
    }

    public void setDrawingShape(String shape) {
        this.drawingShape = shape;
        if ("spray".equals(shape)) {
            this.freeDrawing = true;
        } else {
            this.freeDrawing = false;
        }
        drawingActive = false;
    }

    //metoda do wyboru stylu
    public void setDrawingStyle(String style) {
        this.drawingStyle = style;
    }

    public Color getColor() {
        return this.color;
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

    // Metoda przełączająca tryb gumki
    public void toggleEraser() {
        isEraserActive = !isEraserActive;
    }

    synchronized void drawLine(Color c, int x1, int y1, int x2, int y2) {
        EventQueue.invokeLater(() -> {
            Graphics2D g2d = (Graphics2D) offGraphics;
            g2d.setColor(isEraserActive ? getBackground() : c);
            if ("dashed".equals(drawingStyle)) {
                float[] dashPattern = {10, 10}; // Długość kreski i odstępu
                g2d.setStroke(new BasicStroke(penThickness, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10, dashPattern, 0));
            } else {
                g2d.setStroke(new BasicStroke(penThickness)); // Styl domyślny
            }
            g2d.drawLine(x1, y1, x2, y2);
            repaint();
        });
    }


    synchronized void drawObject(Color c, int startX, int startY, int endX, int endY, String drawingShape) {
        EventQueue.invokeLater(() -> {
            if (isEraserActive) {
                offGraphics.setColor(getBackground());
            } else {
                offGraphics.setColor(c);
            }
            switch (drawingShape) {
                case "line":
                    drawLine(c, startX, startY, endX, endY);
                    break;
                case "rectangle":
                    drawRectangle(c, startX, startY, endX, endY);
                    break;
                case "circle":
                    drawCircle(c, startX, startY, endX, endY);
                    break;
            }
        });
    }

    @Override
    public void mouseMoved(MouseEvent me) {
    }

    @Override
    public void mouseDragged(MouseEvent me) {
        if (isPanning) {
            updatePan(me.getPoint());
            return;
        }if (freeDrawing && "spray".equals(drawingShape)) {
            for (int i = 0; i < SPRAY_DOTS; i++) {
                int offsetX = (int) (Math.random() * SPRAY_RADIUS * 2 - SPRAY_RADIUS);
                int offsetY = (int) (Math.random() * SPRAY_RADIUS * 2 - SPRAY_RADIUS);
                int dotX = me.getX() + offsetX;
                int dotY = me.getY() + offsetY;
                drawDot(color, dotX, dotY);
            }
            controller.mouseDragged(me.getX(), me.getY());
        }
        if (freeDrawing) {
            int tempX = mouseCurrentX;
            int tempY = mouseCurrentY;
            mouseCurrentX = me.getX() - offsetX;
            mouseCurrentY = me.getY() - offsetY;
            drawLine(color, tempX, tempY, mouseCurrentX, mouseCurrentY);
            controller.mouseDragged(mouseCurrentX, mouseCurrentY);
        } else if (isPreviewActive) {
            previewX = me.getX() - offsetX;
            previewY = me.getY() - offsetY;
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
        if (me.isControlDown()) {
            startPan(me.getPoint());
            return;
        }
        startX = me.getX() - offsetX;
        startY = me.getY() - offsetY;
        drawingActive = true;

        if (freeDrawing) {
            mouseCurrentX = startX;
            mouseCurrentY = startY;
        }
        controller.mousePressed(startX, startY);
    }

    @Override
    public void mouseReleased(MouseEvent me) {
        if (isPanning) {
            stopPan();
            return;
        }

        if (!drawingActive) return;

        int endX = me.getX() - offsetX;
        int endY = me.getY() - offsetY;

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
                case "spray":

            }
        }
        controller.mouseReleased(endX, endY, drawingShape);
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

    private void startPan(Point startPoint) {
        isPanning = true;
        lastPanPoint = startPoint;
    }

    private void updatePan(Point currentPoint) {
        if (isPanning && lastPanPoint != null) {
            int deltaX = currentPoint.x - lastPanPoint.x;
            int deltaY = currentPoint.y - lastPanPoint.y;

            offsetX += deltaX;
            offsetY += deltaY;

            lastPanPoint = currentPoint;
            repaint();
        }
    }

    private void stopPan() {
        isPanning = false;
        lastPanPoint = null;
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
        Graphics2D g2d = (Graphics2D) g;


        AffineTransform originalTransform = g2d.getTransform();


        g2d.translate(offsetX, offsetY);

        if (offImage != null) {
            g2d.drawImage(offImage, 0, 0, this);
        }

        if (isPreviewActive) {
            g2d.setColor(color);
            switch (currentShape) {
                case "line":
                    g2d.drawLine(startX, startY, previewX, previewY);
                    break;
                case "rectangle":
                    int x = Math.min(startX, previewX);
                    int y = Math.min(startY, previewY);
                    int width = Math.abs(previewX - startX);
                    int height = Math.abs(previewY - startY);
                    g2d.drawRect(x, y, width, height);
                    break;
                case "circle":
                    x = Math.min(startX, previewX);
                    y = Math.min(startY, previewY);
                    int diameter = Math.max(Math.abs(previewX - startX), Math.abs(previewY - startY));
                    g2d.drawOval(x, y, diameter, diameter);
                    break;
            }
        }


        g2d.setTransform(originalTransform);
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

    public boolean isEraserActive() {
        {

        }
        return false;
    }
    private void drawDot(Color c, int x, int y) {
        EventQueue.invokeLater(() -> {
            if (isEraserActive) {
                offGraphics.setColor(getBackground());
            } else {
                offGraphics.setColor(c);
            }
            offGraphics.fillRect(x, y, 1, 1);
            repaint();
        });
    }
}
