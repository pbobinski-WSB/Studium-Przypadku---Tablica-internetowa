package wsb.sp_pwgp.tablica;

import java.awt.Color;

/**
 * @author kmi
 */
public class IBProtocol {
    static final String LOGIN = "login";

    static final String LOGGEDIN = "loggedin";

    static final String MOUSEPRESSED = "mousepressed";

    static final String MOUSEDRAGGED = "mousedragged";

    static final String MOUSERELEASED = "mousereleased";

    static final String DRAW = "draw";

    static final String LOGOUT = "logout";

    static final String LOGGEDOUT = "loggedout";

    static final String STOP = "stop";

    static final String STOPPED = "stopped";

    static final String NULLCOMMAND = "nullcommand";

    // Specjalny kolor dla gumki
    public static final int ERASER_COLOR = -1;

    static final Color colors[] = { Color.black, Color.blue, Color.cyan,
            Color.green, Color.magenta, Color.orange, Color.pink, Color.red,
            Color.yellow };
}
