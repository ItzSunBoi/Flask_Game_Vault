
"""curvefever multiplayer game handlers."""


def sync(client_id, room, player, ctx):
    fn = ctx.get('sync_curvefever')
    if fn:
        return fn(client_id, room, player)
    return False


def handle(client_id, room, msg, ctx):
    fn = ctx.get('handle_curvefever')
    if fn:
        return fn(client_id, room, msg)
    return False


def start(room, ctx):
    fn = ctx.get('start_curvefever')
    if fn:
        return fn(room)
    return False
