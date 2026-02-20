-- CreateTable
CREATE TABLE "better_auth"."ssoprovider" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "oidcConfig" TEXT,
    "samlConfig" TEXT,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "ssoprovider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ssoprovider_providerId_key" ON "better_auth"."ssoprovider"("providerId");

-- AddForeignKey
ALTER TABLE "better_auth"."ssoprovider" ADD CONSTRAINT "ssoprovider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "better_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
