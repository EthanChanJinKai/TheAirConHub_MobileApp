using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TheAirConHubAPI.Models;

public partial class TheAirConHubDbContext : DbContext
{
    public TheAirConHubDbContext()
    {
    }

    public TheAirConHubDbContext(DbContextOptions<TheAirConHubDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<DailyGameActivity> DailyGameActivities { get; set; }

    public virtual DbSet<GameScore> GameScores { get; set; }

    public virtual DbSet<RewardsCatalog> RewardsCatalogs { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRedemption> UserRedemptions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=TheAirConHubDB;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Bookings__73951ACDEA1FC73E");

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.BookingDate).HasColumnType("datetime");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TechnicianName).HasMaxLength(100);
            entity.Property(e => e.TimeSlot).HasMaxLength(50);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Service).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__Bookings__Servic__52593CB8");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Bookings__UserID__5165187F");
        });

        modelBuilder.Entity<DailyGameActivity>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("PK__DailyGam__45F4A7F1895FF513");

            entity.ToTable("DailyGameActivity");

            entity.Property(e => e.ActivityId).HasColumnName("ActivityID");
            entity.Property(e => e.PlayDate).HasDefaultValueSql("(CONVERT([date],getdate()))");
            entity.Property(e => e.SlotKey).HasMaxLength(20);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.DailyGameActivities)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__DailyGame__UserI__628FA481");
        });

        modelBuilder.Entity<GameScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__GameScor__7DD229F160ABA47B");

            entity.Property(e => e.ScoreId).HasColumnName("ScoreID");
            entity.Property(e => e.GameKey).HasMaxLength(50);
            entity.Property(e => e.PlayedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.GameScores)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__GameScore__UserI__5EBF139D");
        });

        modelBuilder.Entity<RewardsCatalog>(entity =>
        {
            entity.HasKey(e => e.RewardId).HasName("PK__RewardsC__82501599E503FCEB");

            entity.ToTable("RewardsCatalog");

            entity.Property(e => e.RewardId).HasColumnName("RewardID");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Title).HasMaxLength(100);
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Services__C51BB0EAFC333D33");

            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ColorHex).HasMaxLength(20);
            entity.Property(e => e.IconName).HasMaxLength(50);
            entity.Property(e => e.ServiceName).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACD2D176C0");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534E08A4FE5").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.PointsBalance).HasDefaultValue(0);
        });

        modelBuilder.Entity<UserRedemption>(entity =>
        {
            entity.HasKey(e => e.RedemptionId).HasName("PK__UserRede__410680D1F2B30DC9");

            entity.Property(e => e.RedemptionId).HasColumnName("RedemptionID");
            entity.Property(e => e.RedeemedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RewardId).HasColumnName("RewardID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Reward).WithMany(p => p.UserRedemptions)
                .HasForeignKey(d => d.RewardId)
                .HasConstraintName("FK__UserRedem__Rewar__5AEE82B9");

            entity.HasOne(d => d.User).WithMany(p => p.UserRedemptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserRedem__UserI__59FA5E80");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
