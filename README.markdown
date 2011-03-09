# Was ist das?

In den Räumen des Chaos Computer Club Berlin hängt ein LED-Display an der Wand, das
über UDP angesteuert werden kann. Unterstützt werden die Anzeige von Text, jedoch
können einzelne Pixel auch angesteuert werden.

Durch diese library (und dem Node.js Ökosystem) wird es sehr einfach zum
das Display durch Spiele oder andere kollaborative Anwendungen gemeinsam zu
benutzen.

Unter `examples/websocket-draw` ist eine (noch nicht ganz fertige) Mal-Anwendung zu
finden, die das HTML5 `canvas`-Element und Websockets (`Socket.io`) verwendet.
