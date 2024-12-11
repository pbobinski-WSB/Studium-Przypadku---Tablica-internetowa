package wsb.sp_pwgp.tablica;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.StringTokenizer;

/**
 * @author kmi
 */
public class IBClientController implements Runnable {
    private Socket socket = null;
    
    private BufferedReader input;
    private PrintWriter output;
    
    private IBClientView view = null;
    
    public IBClientController(String host, String port) throws Exception {
    	IBClientModel model = new IBClientModel(this);
    	view = new IBClientView(this, model, host + ":" + port);
    	try {
            socket = new Socket(host, Integer.parseInt(port));
        } catch (UnknownHostException e) {
            throw new Exception("Unknown host.");
        } catch (IOException e) {
            throw new Exception("IO exception while connecting to the server.");
        } catch (NumberFormatException e) {
            throw new Exception("Port value must be a number.");
        }
        try {
            input = new BufferedReader(new InputStreamReader(
            		socket.getInputStream()));
            output = new PrintWriter(socket.getOutputStream(), true);
        } catch (IOException ex) {
            throw new Exception("Can not get input/output connection stream.");
        }
        new Thread(this).start();
    }

    boolean isDisconnected() {
    	return socket == null;
    }

    @Override
    public void run() {
    	send(IBProtocol.LOGIN);
    	while (true) {
            try {
                String protocolSentence = receive(); 
                if (!handleCommand(protocolSentence)) {
                    output.close();
                    input.close();
                    socket.close();
                    break;
                }
            } catch (IOException ignore) {
            }
    	}
    	output = null;
        input = null;
        socket = null;
    	view.dispose();
    }

    private boolean handleCommand(String protocolSentence) {
        StringTokenizer st = new StringTokenizer(protocolSentence);
        String command = st.nextToken();
        switch (command) {
        case IBProtocol.LOGGEDIN:
        	int id = Integer.parseInt(st.nextToken());
            int colorIndex = Integer.parseInt(st.nextToken());
            int width = Integer.parseInt(st.nextToken());
            int height = Integer.parseInt(st.nextToken());
            view.createView(colorIndex, width, height);
            view.updateTitle(id + "");
            break;
        case IBProtocol.DRAW:
        	view.drawLine(Integer.parseInt(st.nextToken()),
        			Integer.parseInt(st.nextToken()), 
        			Integer.parseInt(st.nextToken()), 
        			Integer.parseInt(st.nextToken()),
        			Integer.parseInt(st.nextToken()));
        	break;
        case IBProtocol.STOP:
        	send(IBProtocol.STOPPED);
        case IBProtocol.LOGGEDOUT:
        	return false;
        }
        return true;
    }

    void mousePressed(int x, int y) {
        send(IBProtocol.MOUSEPRESSED + " " + x + " " + y);
    }

    void mouseDragged(int x, int y) {
        send(IBProtocol.MOUSEDRAGGED + " " + x + " " + y);
    }

    void mouseReleased(int x, int y) {
        send(IBProtocol.MOUSERELEASED + " " + x + " " + y);
    }

    void send(String command) {
        if (output != null)
            output.println(command);
    }
    
    String receive() throws IOException {
    	return input.readLine();
    }

    void forceLogout() {
		if (socket != null) {
			send(IBProtocol.LOGOUT);
		}
    }
}