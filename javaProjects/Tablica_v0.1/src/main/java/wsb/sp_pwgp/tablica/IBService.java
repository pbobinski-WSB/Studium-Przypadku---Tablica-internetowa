package wsb.sp_pwgp.tablica;

import java.awt.Color;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.net.Socket;
import java.util.StringTokenizer;

/**
 * @author kmi
 */
public class IBService implements Runnable {
    private int id;
    private int color;

    private int currentMouseX, currentMouseY;
    private int lastMouseX, lastMouseY;

    private IBServer server;
    private Socket clientSocket;

    private BufferedReader input;
    private PrintWriter output;

    public IBService(Socket clientSocket, IBServer server) {
        this.server = server;
        this.clientSocket = clientSocket;
    }

    void init() throws IOException {
        Reader reader = new InputStreamReader(clientSocket.getInputStream());
        output = new PrintWriter(clientSocket.getOutputStream(), true);
        input = new BufferedReader(reader);
    }

    void close() {
        try {
            output.close();
            input.close();
            clientSocket.close();
        } catch (IOException e) {
            System.err.println("Error closing client (" + id + "), " + e);
        } finally {
            output = null;
            input = null;
            clientSocket = null;
        }
    }

    public void run() {
        while (true) {
            String protocolSentence = receive();
            StringTokenizer st = new StringTokenizer(protocolSentence);
            String command = st.nextToken();
            switch (command) {
                case IBProtocol.LOGIN:
                    send(IBProtocol.LOGGEDIN + " " + (id = server.nextID()) + " "
                            + (color = server.nextColor()) + " "
                            + server.boardWidth() + " " + server.boardHeight());
                    break;
                case IBProtocol.MOUSEPRESSED:
                    lastMouseX = Integer.parseInt(st.nextToken());
                    lastMouseY = Integer.parseInt(st.nextToken());
                    break;
                case IBProtocol.MOUSEDRAGGED:
                case IBProtocol.MOUSERELEASED:
                    currentMouseX = Integer.parseInt(st.nextToken());
                    currentMouseY = Integer.parseInt(st.nextToken());
                    server.send(IBProtocol.DRAW + " " + color + " " + lastMouseX + " " + lastMouseY
                            + " " + currentMouseX + " " + currentMouseY, this);
                    lastMouseX = currentMouseX;
                    lastMouseY = currentMouseY;
                    break;
                case IBProtocol.DRAW:
                    // Obsługuje rysowanie lub usuwanie (gumka)
                    int colorIndex = Integer.parseInt(st.nextToken());
                    int x1 = Integer.parseInt(st.nextToken());
                    int y1 = Integer.parseInt(st.nextToken());
                    int x2 = Integer.parseInt(st.nextToken());
                    int y2 = Integer.parseInt(st.nextToken());

                    // Jeśli gumka jest aktywna (colorIndex == ERASER_COLOR), użyj koloru tła do "usuwania"
                    Color drawColor = (colorIndex == IBProtocol.ERASER_COLOR) ? Color.lightGray : IBProtocol.colors[colorIndex];

                    // Przesyłanie polecenia rysowania (lub usuwania) do wszystkich klientów
                    server.send(IBProtocol.DRAW + " " + colorIndex + " " + x1 + " " + y1 + " " + x2 + " " + y2, this);
                    break;
                case IBProtocol.LOGOUT:
                    send(IBProtocol.LOGGEDOUT); // no break!
                case IBProtocol.STOPPED:
                    server.removeClientService(this);// no break!
                case IBProtocol.NULLCOMMAND:
                    return;
            }
        }
    }

    void send(String command) {
        output.println(command);
    }

    private String receive() {
        try {
            return input.readLine();
        } catch (IOException e) {
            System.err.println("Error reading client (" + id + ").");
        }
        return IBProtocol.NULLCOMMAND;
    }
}
