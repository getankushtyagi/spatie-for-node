import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Media } from './media.entity';

@Entity('media_conversions')
export class MediaConversion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    mediaId!: number;

    @Column()
    name!: string;

    @Column()
    fileName!: string;

    @Column()
    mimeType!: string;

    @Column()
    size!: number;

    @Column()
    path!: string;

    @Column()
    url!: string;

    @Column({ nullable: true })
    width!: number;

    @Column({ nullable: true })
    height!: number;

    @ManyToOne(() => Media, media => media.conversions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'mediaId' })
    media!: Media;

    @CreateDateColumn()
    createdAt!: Date;
}