use ggez::{Context, ContextBuilder, GameResult};
use ggez::event::{self, EventHandler};
use ggez::input::keyboard::KeyCode;
use ggez::graphics::{self, Color, Drawable, Text};
use ggez::timer;
use rand::Rng;

const SCREEN_WIDTH: f32 = 800.0;
const SCREEN_HEIGHT: f32 = 600.0;
const BIRD_SIZE: f32 = 20.0;
const GRAVITY: f32 = 0.2;
const JUMP_STRENGTH: f32 = -5.0;
const PIPE_WIDTH: f32 = 50.0;
const PIPE_GAP: f32 = 150.0;
const PIPE_SPEED: f32 = 2.0;

struct Bird {
    x: f32,
    y: f32,
    velocity: f32,
}

impl Bird {
    fn new(x: f32, y: f32) -> Self {
        Bird { x, y, velocity: 0.0 }
    }

    fn update(&mut self) {
        self.velocity += GRAVITY;
        self.y += self.velocity;
        if self.y > SCREEN_HEIGHT - BIRD_SIZE / 2.0 {
            self.y = SCREEN_HEIGHT - BIRD_SIZE / 2.0;
            self.velocity = 0.0;
        }
    }

    fn jump(&mut self) {
        self.velocity = JUMP_STRENGTH;
    }
}

struct Pipe {
    x: f32,
    height: f32,
}

impl Pipe {
    fn new(x: f32, height: f32) -> Self {
        Pipe { x, height }
    }

    fn update(&mut self) {
        self.x -= PIPE_SPEED;
    }
}

struct Cloud {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

impl Cloud {
    fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Cloud { x, y, width, height }
    }

    fn update(&mut self) {
        self.x -= 1.0; // Move the cloud to the left
    }
}

struct MainState {
    bird: Bird,
    pipes: Vec<Pipe>,
    clouds: Vec<Cloud>,
    score: i32,
    game_over: bool,
}

impl MainState {
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

    fn reset(&mut self) {
        self.bird = Bird::new(SCREEN_WIDTH / 4.0, SCREEN_HEIGHT / 2.0);
        self.pipes.clear();
        self.score = 0;
        self.game_over = false;
    }

    fn add_pipe(&mut self) {
        let mut rng = rand::thread_rng();
        let height = rng.gen_range(100.0..(SCREEN_HEIGHT - PIPE_GAP - 100.0));
        self.pipes.push(Pipe::new(SCREEN_WIDTH, height));
    }

    fn check_collision(&self) -> bool {
        for pipe in &self.pipes {
            if self.bird.x + BIRD_SIZE / 2.0 > pipe.x && self.bird.x - BIRD_SIZE / 2.0 < pipe.x + PIPE_WIDTH {
                if self.bird.y - BIRD_SIZE / 2.0 < pipe.height || self.bird.y + BIRD_SIZE / 2.0 > pipe.height + PIPE_GAP {
                    return true;
                }
            }
        }
        false
    }

    fn update_score(&mut self) {
        for pipe in &self.pipes {
            if pipe.x + PIPE_WIDTH < self.bird.x && pipe.x + PIPE_WIDTH >= self.bird.x - PIPE_SPEED {
                self.score += 1;
            }
        }
    }
}

impl EventHandler for MainState {
    fn update(&mut self, ctx: &mut Context) -> GameResult<()> {
        if self.game_over {
            return Ok(());
        }

        self.bird.update();

        if self.check_collision() {
            self.game_over = true;
        }

        for pipe in &mut self.pipes {
            pipe.update();
        }

        self.pipes.retain(|pipe| pipe.x + PIPE_WIDTH > 0.0);

        if timer::ticks(ctx) % 100 == 0 {
            self.add_pipe();
        }

        self.update_score();

        // Update clouds
        for cloud in &mut self.clouds {
            cloud.update();
        }

        // Remove off-screen clouds and add new ones
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

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        let mut canvas = graphics::Canvas::from_frame(ctx, Color::from_rgb(135, 206, 235)); // Sky blue background

        // Draw clouds
        for cloud in &self.clouds {
            let cloud_rect = graphics::Rect::new(cloud.x, cloud.y, cloud.width, cloud.height);
            let cloud_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), cloud_rect, Color::from_rgb(255, 255, 255))?;
            cloud_mesh.draw(&mut canvas, graphics::DrawParam::default());
        }

        let bird_rect = graphics::Rect::new(self.bird.x - BIRD_SIZE / 2.0, self.bird.y - BIRD_SIZE / 2.0, BIRD_SIZE, BIRD_SIZE);
        let bird_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), bird_rect, Color::from_rgb(255, 255, 0))?;
        bird_mesh.draw(&mut canvas, graphics::DrawParam::default());

        for pipe in &self.pipes {
            let top_rect = graphics::Rect::new(pipe.x, 0.0, PIPE_WIDTH, pipe.height);
            let bottom_rect = graphics::Rect::new(pipe.x, pipe.height + PIPE_GAP, PIPE_WIDTH, SCREEN_HEIGHT - pipe.height - PIPE_GAP);
            
            // Draw the main part of the pipes
            let pipe_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), top_rect, Color::from_rgb(0, 255, 0))?;
            pipe_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let pipe_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), bottom_rect, Color::from_rgb(0, 255, 0))?;
            pipe_mesh.draw(&mut canvas, graphics::DrawParam::default());

            // Add caps to the pipes
            let cap_height = 10.0;
            let top_cap_rect = graphics::Rect::new(pipe.x, pipe.height - cap_height, PIPE_WIDTH, cap_height);
            let bottom_cap_rect = graphics::Rect::new(pipe.x, pipe.height + PIPE_GAP, PIPE_WIDTH, cap_height);
            let cap_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), top_cap_rect, Color::from_rgb(0, 200, 0))?;
            cap_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let cap_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), bottom_cap_rect, Color::from_rgb(0, 200, 0))?;
            cap_mesh.draw(&mut canvas, graphics::DrawParam::default());

            // Add shadows to the pipes
            let shadow_offset = 5.0;
            let top_shadow_rect = graphics::Rect::new(pipe.x + shadow_offset, 0.0, PIPE_WIDTH, pipe.height);
            let bottom_shadow_rect = graphics::Rect::new(pipe.x + shadow_offset, pipe.height + PIPE_GAP, PIPE_WIDTH, SCREEN_HEIGHT - pipe.height - PIPE_GAP);
            let shadow_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), top_shadow_rect, Color::from_rgb(0, 150, 0))?;
            shadow_mesh.draw(&mut canvas, graphics::DrawParam::default());
            let shadow_mesh = graphics::Mesh::new_rectangle(ctx, graphics::DrawMode::fill(), bottom_shadow_rect, Color::from_rgb(0, 150, 0))?;
            shadow_mesh.draw(&mut canvas, graphics::DrawParam::default());
        }

        let score_display = Text::new(format!("Score: {}", self.score));
        score_display.draw(&mut canvas, graphics::DrawParam::default().dest([10.0, 10.0]));

        if self.game_over {
            let game_over_text = Text::new("Game Over! Press R to Restart");
            game_over_text.draw(&mut canvas, graphics::DrawParam::default().dest([SCREEN_WIDTH / 2.0 - 100.0, SCREEN_HEIGHT / 2.0]));
        }

        canvas.finish(ctx)?;
        Ok(())
    }

    fn key_down_event(&mut self, _ctx: &mut Context, input: ggez::input::keyboard::KeyInput, _repeat: bool) -> GameResult<()> {
        if input.keycode == Some(KeyCode::Space) && !self.game_over {
            self.bird.jump();
        }
        if input.keycode == Some(KeyCode::R) && self.game_over {
            self.reset();
        }
        Ok(())
    }
}

fn main() -> GameResult {
    let (ctx, event_loop) = ContextBuilder::new("fappy_berd", "ferncx")
        .window_setup(ggez::conf::WindowSetup::default().title("fappy berd"))
        .window_mode(ggez::conf::WindowMode::default().dimensions(SCREEN_WIDTH, SCREEN_HEIGHT))
        
        .build()?;

    let state = MainState::new()?;
    event::run(ctx, event_loop, state)
}