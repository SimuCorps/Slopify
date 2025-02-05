using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SloppyMonogame;

public class Game1 : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private Color _clearColor = Color.GreenYellow;

    public Game1()
    {
        _graphics = new GraphicsDeviceManager(this);
        Content.RootDirectory = "Content";
        IsMouseVisible = true;
    }

    protected override void Initialize()
    {
        base.Initialize();
    }

    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);

        // TODO: use this.Content to load your game content here
    }

    protected override void Update(GameTime gameTime)
    {
        if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed ||
            Keyboard.GetState().IsKeyDown(Keys.Escape))
            Exit();

        // TODO: Add your update logic here

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(_clearColor);
        MutateColor(gameTime);

        base.Draw(gameTime);
    }
    
    private void MutateColor(GameTime gameTime)
    {
        var r = (float)Math.Sin(gameTime.TotalGameTime.TotalSeconds);
        var g = (float)Math.Cos(gameTime.TotalGameTime.TotalSeconds);
        var b = (float)Math.Tan(gameTime.TotalGameTime.TotalSeconds);
        _clearColor = new Color(r, g, b);
    }
}