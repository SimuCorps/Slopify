-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "twitter_handle" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);
