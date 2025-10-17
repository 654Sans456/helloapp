var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

/*----------------------------------------------------------------*/
app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/index.html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Redirect("/gameZone");
        return;
    }
    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/gameZone")
    {
        context.Request.Path = "/index.html";
    }
    await next();
});
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/results.html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Redirect("/resultsPlayng");
        return;
    }
    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/resultsPlayng")
    {
        context.Request.Path = "/results.html";
    }
    await next();
});
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/settings.html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Redirect("/settings");
        return;
    }
    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/settings")
    {
        context.Request.Path = "/settings.html";
    }
    await next();
});
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/leaderboard.html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Redirect("/leaderboard");
        return;
    }
    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/leaderboard")
    {
        context.Request.Path = "/leaderboard.html";
    }
    await next();
});
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/menu.html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Redirect("/");
        return;
    }
    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Request.Path = "/menu.html";
    }
    await next();
});
/*----------------------------------------------------------------*/

app.UseStaticFiles();
app.MapControllers();

app.Run();
