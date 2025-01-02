// Import necessary modules and traits from the ggez crate
use ggez::event::{self, EventHandler};
use ggez::graphics::{self, Color, Drawable, Text};
use ggez::input::keyboard::KeyCode;
use ggez::timer;
use ggez::{Context, ContextBuilder, GameResult};

// Import the Rng trait from the rand crate for random number generation
use rand::Rng;

// Floats are being used here:
/// Screen width in pixels
const SCREEN_WIDTH: f32 = 800.0;
/// Screen height in pixels
const SCREEN_HEIGHT: f32 = 600.0;
/// Size of the bird in pixels
const BIRD_SIZE: f32 = 20.0;
/// Gravity constant affecting the bird's velocity
const GRAVITY: f32 = 0.2;
/// Strength of the bird's jump (negative value for upward movement)
const JUMP_STRENGTH: f32 = -5.0;
/// Width of the pipes in pixels
const PIPE_WIDTH: f32 = 50.0;
/// Gap between the top and bottom pipes in pixels
const PIPE_GAP: f32 = 150.0;
/// Speed at which the pipes move to the left in pixels per update
const PIPE_SPEED: f32 = 2.0;

/// Represents a bird with position and velocity.
struct Bird {
    /// The x-coordinate of the bird.
    x: f32,
    /// The y-coordinate of the bird.
    y: f32,
    /// The velocity of the bird.
    velocity: f32,
}

impl Bird {
    /// Create a new bird at the given position
    ///
    /// # Arguments
    ///
    /// * `x` - The x-coordinate of the bird
    /// * `y` - The y-coordinate of the bird
    ///
    /// # Returns
    ///
    /// A new Bird instance
    fn new(x: f32, y: f32) -> Self {
        Bird {
            x,
            y,
            velocity: 0.0,
        }
    }

    /// Update the bird's position based on its velocity and gravity
    fn update(&mut self) {
        self.velocity += GRAVITY;
        self.y += self.velocity;
        if self.y > SCREEN_HEIGHT - BIRD_SIZE / 2.0 {
            self.y = SCREEN_HEIGHT - BIRD_SIZE / 2.0;
            self.velocity = 0.0;
        }
    }

    /// Make the bird jump by setting its velocity
    fn jump(&mut self) {
        self.velocity = JUMP_STRENGTH;
    }
}

/// Represents a pipe with a specific position and height.
struct Pipe {
    /// The x-coordinate of the pipe.
    x: f32,
    /// The height of the pipe.
    height: f32,
}

impl Pipe {
    /// Create a new pipe at the given position with the given height
    ///
    /// # Arguments
    ///
    /// * `x` - The x-coordinate of the pipe
    /// * `height` - The height of the pipe
    ///
    /// # Returns
    ///
    /// A new Pipe instance
    fn new(x: f32, height: f32) -> Self {
        Pipe { x, height }
    }

    /// Update the pipe's position by moving it to the left
    fn update(&mut self) {
        self.x -= PIPE_SPEED;
    }
}

/// Represents a cloud with its position and dimensions.
struct Cloud {
    /// The x-coordinate of the cloud.
    x: f32,
    /// The y-coordinate of the cloud.
    y: f32,
    /// The width of the cloud.
    width: f32,
    /// The height of the cloud.
    height: f32,
}

impl Cloud {
    /// Create a new cloud at the given position with the given dimensions
    ///
    /// # Arguments
    ///
    /// * `x` - The x-coordinate of the cloud
    /// * `y` - The y-coordinate of the cloud
    /// * `width` - The width of the cloud
    /// * `height` - The height of the cloud
    ///
    /// # Returns
    ///
    /// A new Cloud instance
    fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Cloud {
            x,
            y,
            width,
            height,
        }
    }

    /// Update the cloud's position by moving it to the left
    fn update(&mut self) {
        self.x -= 1.0; // Move the cloud to the left
    }
}

/// Represents the main state of the game.
struct MainState {
    /// The bird controlled by the player.
    bird: Bird,
    /// A collection of pipes that the bird must navigate through.
    pipes: Vec<Pipe>,
    /// A collection of clouds for background scenery.
    clouds: Vec<Cloud>,
    /// The current score of the player.
    score: i32,
    /// Indicates whether the game is over.
    game_over: bool,
}

impl MainState {
    /// Create a new game state with a bird, empty pipes, and random clouds
    ///
    /// # Returns
    ///
    /// A `GameResult` containing the new game state
    fn new() -> GameResult<MainState> {
        let mut rng = rand::thread_rng();
        let mut clouds = Vec::new();
        for _ in 0..10 {
            let x = rng.gen_range(0.0..SCREEN_WIDTH);
            let y = rng.gen_range(0.0..SCREEN_HEIGHT / 2.0);
            let width = rng.gen_range(50.0..150.0);
            let height = rng.gen_range(20.0..50.0);
            clouds.push(Cloud::new(x, y, width, height));
        }

        let s = MainState {
            bird: Bird::new(SCREEN_WIDTH / 4.0, SCREEN_HEIGHT / 2.0),
            pipes: vec![],
            clouds,
            score: 0,
            game_over: false,
        };
        Ok(s)
    }

    /// Reset the game state to start a new game
    fn reset(&mut self) {
        self.bird = Bird::new(SCREEN_WIDTH / 4.0, SCREEN_HEIGHT / 2.0);
        self.pipes.clear();
        self.score = 0;
        self.game_over = false;
    }

    /// Add a new pipe at the right edge of the screen with a random height
    fn add_pipe(&mut self) {
        let mut rng = rand::thread_rng();
        let height = rng.gen_range(100.0..(SCREEN_HEIGHT - PIPE_GAP - 100.0));
        self.pipes.push(Pipe::new(SCREEN_WIDTH, height));
    }

    /// Check if the bird has collided with any pipes
    ///
    /// # Returns
    ///
    /// A boolean indicating whether a collision has occurred
    fn check_collision(&self) -> bool {
        for pipe in &self.pipes {
            if self.bird.x + BIRD_SIZE / 2.0 > pipe.x
                && self.bird.x - BIRD_SIZE / 2.0 < pipe.x + PIPE_WIDTH
            {
                if self.bird.y - BIRD_SIZE / 2.0 < pipe.height
                    || self.bird.y + BIRD_SIZE / 2.0 > pipe.height + PIPE_GAP
                {
                    return true;
                }
            }
        }
        false
    }

    /// Update the score based on the bird passing through pipes
    fn update_score(&mut self) {
        for pipe in &self.pipes {
            if pipe.x + PIPE_WIDTH < self.bird.x && pipe.x + PIPE_WIDTH >= self.bird.x - PIPE_SPEED
            {
                self.score += 1;
            }
        }
    }
}

// Implementation of the EventHandler trait for the MainState struct
impl EventHandler for MainState {
    /// The update function is called periodically to update the game state
    ///
    /// # Arguments
    ///
    /// * `ctx` - The game context containing information about the game state
    ///
    /// # Returns
    ///
    /// A `GameResult` containing the updated game state
    fn update(&mut self, ctx: &mut Context) -> GameResult<()> {
        // If the game is over, do nothing and return
        if self.game_over {
            return Ok(());
        }

        // Update the bird's position
        self.bird.update();

        // Check for collisions and set game_over to true if a collision is detected
        if self.check_collision() {
            self.game_over = true;
        }

        // Update the position of each pipe
        for pipe in &mut self.pipes {
            pipe.update();
        }

        // Remove pipes that have moved off-screen
        self.pipes.retain(|pipe| pipe.x + PIPE_WIDTH > 0.0);

        // Add a new pipe every 100 ticks
        if timer::ticks(ctx) % 100 == 0 {
            self.add_pipe();
        }

        // Update the score
        self.update_score();

        // Update the position of each cloud
        for cloud in &mut self.clouds {
            cloud.update();
        }

        // Remove clouds that have moved off-screen and add new ones if there are less than 10 clouds
        self.clouds.retain(|cloud| cloud.x + cloud.width > 0.0);
        if self.clouds.len() < 10 {
            let mut rng = rand::thread_rng();
            let x = SCREEN_WIDTH;
            let y = rng.gen_range(0.0..SCREEN_HEIGHT / 2.0);
            let width = rng.gen_range(50.0..150.0);
            let height = rng.gen_range(20.0..50.0);
            self.clouds.push(Cloud::new(x, y, width, height));
        }

        Ok(())
    }
    /// The draw function is called to render the game state to the screen
    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        // Create a canvas with a sky blue background
        let mut canvas = graphics::Canvas::from_frame(ctx, Color::from_rgb(135, 206, 235));

        // Draw each cloud as a white rectangle
        for cloud in &self.clouds {
            let cloud_rect = graphics::Rect::new(cloud.x, cloud.y, cloud.width, cloud.height);
            let cloud_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                cloud_rect,
                Color::from_rgb(255, 255, 255),
            )?;
            cloud_mesh.draw(&mut canvas, graphics::DrawParam::default());
        }

        // Draw the bird as a yellow rectangle
        let bird_rect = graphics::Rect::new(
            self.bird.x - BIRD_SIZE / 2.0,
            self.bird.y - BIRD_SIZE / 2.0,
            BIRD_SIZE,
            BIRD_SIZE,
        );
        let bird_mesh = graphics::Mesh::new_rectangle(
            ctx,
            graphics::DrawMode::fill(),
            bird_rect,
            Color::from_rgb(255, 255, 0),
        )?;
        bird_mesh.draw(&mut canvas, graphics::DrawParam::default());

        // Draw each pipe as a green rectangle with caps and shadows
        for pipe in &self.pipes {
            let top_rect = graphics::Rect::new(pipe.x, 0.0, PIPE_WIDTH, pipe.height);
            let bottom_rect = graphics::Rect::new(
                pipe.x,
                pipe.height + PIPE_GAP,
                PIPE_WIDTH,
                SCREEN_HEIGHT - pipe.height - PIPE_GAP,
            );

            // Draw the main part of the pipes
            let pipe_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                top_rect,
                Color::from_rgb(0, 255, 0),
            )?;
            pipe_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let pipe_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                bottom_rect,
                Color::from_rgb(0, 255, 0),
            )?;
            pipe_mesh.draw(&mut canvas, graphics::DrawParam::default());

            // Add caps to the pipes
            let cap_height = 10.0;
            let top_cap_rect =
                graphics::Rect::new(pipe.x, pipe.height - cap_height, PIPE_WIDTH, cap_height);
            let bottom_cap_rect =
                graphics::Rect::new(pipe.x, pipe.height + PIPE_GAP, PIPE_WIDTH, cap_height);
            let cap_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                top_cap_rect,
                Color::from_rgb(0, 200, 0),
            )?;
            cap_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let cap_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                bottom_cap_rect,
                Color::from_rgb(0, 200, 0),
            )?;
            cap_mesh.draw(&mut canvas, graphics::DrawParam::default());

            // Add shadows to the pipes
            let shadow_offset = 5.0;
            let top_shadow_rect =
                graphics::Rect::new(pipe.x + shadow_offset, 0.0, PIPE_WIDTH, pipe.height);
            let bottom_shadow_rect = graphics::Rect::new(
                pipe.x + shadow_offset,
                pipe.height + PIPE_GAP,
                PIPE_WIDTH,
                SCREEN_HEIGHT - pipe.height - PIPE_GAP,
            );
            let shadow_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                top_shadow_rect,
                Color::from_rgb(0, 150, 0),
            )?;
            shadow_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let shadow_mesh = graphics::Mesh::new_rectangle(
                ctx,
                graphics::DrawMode::fill(),
                bottom_shadow_rect,
                Color::from_rgb(0, 150, 0),
            )?;
            shadow_mesh.draw(&mut canvas, graphics::DrawParam::default());
        }

        // Display the current score
        let score_display = Text::new(format!("Score: {}", self.score));
        score_display.draw(
            &mut canvas,
            graphics::DrawParam::default().dest([10.0, 10.0]),
        );

        // If the game is over, display a game over message
        if self.game_over {
            let game_over_text = Text::new("Game Over! Press R to Restart");
            game_over_text.draw(
                &mut canvas,
                graphics::DrawParam::default()
                    .dest([SCREEN_WIDTH / 2.0 - 100.0, SCREEN_HEIGHT / 2.0]),
            );
        }

        // Finish drawing to the canvas
        canvas.finish(ctx)?;
        Ok(())
    }

    /// The key_down_event function is called when a key is pressed
    ///
    /// # Arguments
    ///
    /// * `ctx` - The game context containing information about the game state
    /// * `input` - The key input event containing information about the key that was pressed
    /// * `repeat` - A boolean indicating whether the key press is a repeat event
    ///
    /// # Returns
    ///
    /// A `GameResult` containing the updated game state
    fn key_down_event(
        &mut self,
        _ctx: &mut Context,
        input: ggez::input::keyboard::KeyInput,
        _repeat: bool,
    ) -> GameResult<()> {
        // If the space key is pressed and the game is not over, make the bird jump
        if input.keycode == Some(KeyCode::Space) && !self.game_over {
            self.bird.jump();
        }
        // If the R key is pressed and the game is over, reset the game
        if input.keycode == Some(KeyCode::R) && self.game_over {
            self.reset();
        }
        Ok(())
    }
}

/// The main function initializes the game context and event loop, creates the game state, and starts the game.
///
/// # Returns
///
/// A `GameResult` containing the result of running the game
fn main() -> GameResult {
    // Create a new game context and event loop with the specified window title and dimensions
    let (ctx, event_loop) = ContextBuilder::new("fappy_berd", "ferncx")
        .window_setup(ggez::conf::WindowSetup::default().title("fappy berd"))
        .window_mode(ggez::conf::WindowMode::default().dimensions(SCREEN_WIDTH, SCREEN_HEIGHT))
        .build()?;

    // Create a new game state
    let state = MainState::new()?;
    // Run the game with the created context, event loop, and game state
    event::run(ctx, event_loop, state)
}
