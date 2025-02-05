using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SloppyMonogame.Sloppies.Input;

namespace SloppyMonogame;

public class Game1 : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private Color _clearColor = Color.GreenYellow;
    private MouseInput _mouseInput = new();

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

        _mouseInput.Update();
        
        var r = (float)Math.Sin(_mouseInput.Position.X * 0.001F);
        var g = (float)Math.Cos(_mouseInput.Position.Y * 0.001F);
        var b = (float)Math.Tan(_mouseInput.GetTravelDistance() * 0.001F);
        _clearColor = new Color(r, g, b);

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(_clearColor);

        base.Draw(gameTime);
    }
}